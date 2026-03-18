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

export async function importStandingsPdf(
  databaseUrl: string,
  input: ImportStandingsInput
) {
  const sql = postgres(databaseUrl);

  const parsed = await parseStandingsPdf(input.pdfBuffer);

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
