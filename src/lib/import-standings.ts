import postgres from "postgres";
import { parseStandingsPdf } from "./parse-standings-pdf";
import { normalizeCountryCode, normalizePersonName } from "./normalizers";

export interface ImportStandingsInput {
  pdfBuffer: Buffer;
  fileName: string;
  eventDate: string;
  location: string;
  countryCode: string;
  tournamentType: string;
}

export interface ImportStandingsIntoExistingEventInput {
  eventId: string;
  pdfBuffer: Buffer;
  fileName: string;
}

type ExistingEventRow = {
  id: string;
  name: string;
  event_date: string;
  location: string;
  country_code: string;
  tournament_type: string;
  source_file_name: string | null;
};

async function insertParsedResultsForEvent(
  sql: postgres.Sql,
  eventId: string,
  importRunId: string,
  parsed: Awaited<ReturnType<typeof parseStandingsPdf>>
) {
  for (const category of parsed.categories) {
    const categoryRows = await sql<[{ id: string }]>`
      insert into public.event_categories (
        event_id,
        raw_name,
        arm,
        gender,
        division_type,
        weight_class,
        athlete_count,
        category_type
      )
      values (
        ${eventId},
        ${category.name},
        ${category.arm},
        ${category.gender},
        ${category.type},
        ${category.weightClass},
        ${category.placements.length},
        public.get_category_type(${category.name})
      )
      returning id
    `;

    const categoryId = categoryRows[0].id;

    for (const placement of category.placements) {
      const normalizedName = normalizePersonName(placement.name);
      const normalizedCountryCode = normalizeCountryCode(placement.country);

      await sql`
        insert into public.event_results_raw (
          event_id,
          category_id,
          placement,
          raw_athlete_name,
          normalized_raw_name,
          raw_country,
          normalized_country_code,
          match_status,
          parser_notes
        )
        values (
          ${eventId},
          ${categoryId},
          ${placement.position},
          ${placement.name},
          ${normalizedName},
          ${placement.country},
          ${normalizedCountryCode},
          'unmatched',
          ${`import_run_id=${importRunId}`}
        )
      `;
    }
  }
}

export async function importStandingsPdf(
  databaseUrl: string,
  input: ImportStandingsInput
) {
  const sql = postgres(databaseUrl);

  const parsed = await parseStandingsPdf(input.pdfBuffer);

  const existingEvent = await sql<[{ id: string }] | []>`
    select id
    from public.events
    where source_file_name = ${input.fileName}
      and event_date = ${input.eventDate}
      and location = ${input.location}
    limit 1
  `;

  if (existingEvent.length > 0) {
    await sql.end();
    throw new Error(
      `Dieses PDF wurde vermutlich bereits importiert. Event existiert schon mit file=${input.fileName}, date=${input.eventDate}, location=${input.location}`
    );
  }

  const importRunRows = await sql<[{ id: string }]>`
    insert into public.import_runs (
      source_file_name,
      import_type,
      status,
      notes
    )
    values (
      ${input.fileName},
      'pdf_standings',
      'pending',
      'started from import service'
    )
    returning id
  `;

  const importRunId = importRunRows[0].id;

  try {
    const eventRows = await sql<[{ id: string }]>`
      insert into public.events (
        name,
        event_date,
        location,
        country_code,
        tournament_type,
        source_file_name,
        source_notes
      )
      values (
        ${parsed.tournamentName || "Unknown Tournament"},
        ${input.eventDate},
        ${input.location},
        ${input.countryCode},
        ${input.tournamentType},
        ${input.fileName},
        ${`import_run_id=${importRunId}`}
      )
      returning id
    `;

    const eventId = eventRows[0].id;

    await sql`
      update public.import_runs
      set event_id = ${eventId}
      where id = ${importRunId}
    `;

    await insertParsedResultsForEvent(sql, eventId, importRunId, parsed);

    await sql`
      update public.import_runs
      set
        status = 'parsed',
        notes = ${`parsed successfully: ${parsed.categories.length} categories, ${parsed.uniqueAthletes.length} unique athletes`}
      where id = ${importRunId}
    `;

    return {
      success: true,
      importRunId,
      eventId,
      tournamentName: parsed.tournamentName,
      categoriesCount: parsed.categories.length,
      uniqueAthletesCount: parsed.uniqueAthletes.length,
      mode: "created_new_event",
    };
  } catch (error) {
    await sql`
      update public.import_runs
      set
        status = 'failed',
        notes = ${String(error)}
      where id = ${importRunId}
    `;

    throw error;
  } finally {
    await sql.end();
  }
}

export async function importStandingsIntoExistingEvent(
  databaseUrl: string,
  input: ImportStandingsIntoExistingEventInput
) {
  const sql = postgres(databaseUrl);

  const parsed = await parseStandingsPdf(input.pdfBuffer);

  const existingEventRows = await sql<ExistingEventRow[]>`
    select
      id,
      name,
      event_date,
      location,
      country_code,
      tournament_type,
      source_file_name
    from public.events
    where id = ${input.eventId}
    limit 1
  `;

  if (existingEventRows.length === 0) {
    await sql.end();
    throw new Error(`Event mit id=${input.eventId} wurde nicht gefunden`);
  }

  const event = existingEventRows[0];

  const existingImport = await sql<[{ id: string }] | []>`
    select ir.id
    from public.import_runs ir
    where ir.event_id = ${input.eventId}
      and ir.source_file_name = ${input.fileName}
    limit 1
  `;

  if (existingImport.length > 0) {
    await sql.end();
    throw new Error(
      `Dieses PDF wurde für dieses Event vermutlich bereits importiert. eventId=${input.eventId}, file=${input.fileName}`
    );
  }

  const existingCategories = await sql<[{ cnt: number }] | []>`
    select count(*)::int as cnt
    from public.event_categories
    where event_id = ${input.eventId}
  `;

  if (existingCategories.length > 0 && existingCategories[0].cnt > 0) {
    await sql.end();
    throw new Error(
      `Dieses Event hat bereits importierte Kategorien/Resultate. Import für eventId=${input.eventId} wurde aus Sicherheitsgründen abgebrochen.`
    );
  }

  const importRunRows = await sql<[{ id: string }]>`
    insert into public.import_runs (
      source_file_name,
      import_type,
      status,
      event_id,
      notes
    )
    values (
      ${input.fileName},
      'pdf_standings',
      'pending',
      ${input.eventId},
      ${`started from import service for existing event ${input.eventId}`}
    )
    returning id
  `;

  const importRunId = importRunRows[0].id;

  try {
    await insertParsedResultsForEvent(sql, input.eventId, importRunId, parsed);

    await sql`
      update public.events
      set
        source_file_name = ${input.fileName},
        source_notes = ${`import_run_id=${importRunId}`}
      where id = ${input.eventId}
    `;

    await sql`
      update public.import_runs
      set
        status = 'parsed',
        notes = ${`parsed successfully into existing event: ${parsed.categories.length} categories, ${parsed.uniqueAthletes.length} unique athletes`}
      where id = ${importRunId}
    `;

    return {
      success: true,
      importRunId,
      eventId: input.eventId,
      eventName: event.name,
      tournamentNameFromPdf: parsed.tournamentName,
      categoriesCount: parsed.categories.length,
      uniqueAthletesCount: parsed.uniqueAthletes.length,
      mode: "used_existing_event",
    };
  } catch (error) {
    await sql`
      update public.import_runs
      set
        status = 'failed',
        notes = ${String(error)}
      where id = ${importRunId}
    `;

    throw error;
  } finally {
    await sql.end();
  }
}