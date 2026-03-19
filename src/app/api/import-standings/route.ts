import { NextRequest, NextResponse } from "next/server";
import {
  importStandingsPdf,
  importStandingsIntoExistingEvent,
} from "@/lib/import-standings";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

// Vorerst drin gelassen, aktuell aber weiter deaktiviert
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return data.user;
}

async function isSuperAdmin(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .single();

  return !!data;
}

export async function POST(request: NextRequest) {
  // TEMPORÄR AUTH DISABLED FOR TESTING
  // const user = await getUserFromRequest(request);
  // if (!user) {
  //   return withCors(
  //     NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   );
  // }
  // const isAdmin = await isSuperAdmin(user.id);
  // if (!isAdmin) {
  //   return withCors(
  //     NextResponse.json({ error: "Forbidden" }, { status: 403 })
  //   );
  // }

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return withCors(
        NextResponse.json(
          { error: "DATABASE_URL fehlt auf dem Server" },
          { status: 500 }
        )
      );
    }

    let pdfBuffer: Buffer | null = null;
    let fileName: string | null = null;
    let eventId: string | null = null;

    // Nur für alten Fallback-Modus ohne bestehendes Event
    let eventDate: string | null = null;
    let location: string | null = null;
    let countryCode: string | null = null;
    let tournamentType: string | null = null;

    const requestContentType = request.headers.get("content-type") || "";

    if (requestContentType.includes("application/json")) {
      const body = await request.json();

      const pdfUrl =
        typeof body.pdfUrl === "string" ? body.pdfUrl.trim() : null;

      fileName =
        typeof body.fileName === "string" ? body.fileName.trim() : null;
      eventId =
        typeof body.eventId === "string" ? body.eventId.trim() : null;

      eventDate =
        typeof body.eventDate === "string" ? body.eventDate.trim() : null;
      location =
        typeof body.location === "string" ? body.location.trim() : null;
      countryCode =
        typeof body.countryCode === "string" ? body.countryCode.trim() : null;
      tournamentType =
        typeof body.tournamentType === "string"
          ? body.tournamentType.trim()
          : null;

      if (!pdfUrl) {
        return withCors(
          NextResponse.json(
            { error: "Keine PDF-URL angegeben" },
            { status: 400 }
          )
        );
      }

      const response = await fetch(pdfUrl);

      if (!response.ok) {
        return withCors(
          NextResponse.json(
            { error: "PDF konnte nicht geladen werden" },
            { status: 400 }
          )
        );
      }

      const pdfContentType = response.headers.get("content-type") || "";
      if (!pdfContentType.toLowerCase().includes("pdf")) {
        return withCors(
          NextResponse.json(
            { error: "Die angegebene Datei ist keine PDF" },
            { status: 400 }
          )
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);

      if (!fileName) {
        fileName = pdfUrl.split("/").pop() || "uploaded-results.pdf";
      }
    } else {
      const formData = await request.formData();

      const file = formData.get("file") as File | null;

      if (!file) {
        return withCors(
          NextResponse.json(
            { error: "Keine Datei hochgeladen" },
            { status: 400 }
          )
        );
      }

      if (file.type !== "application/pdf") {
        return withCors(
          NextResponse.json(
            { error: `Datei muss ein PDF sein (erhalten: ${file.type})` },
            { status: 400 }
          )
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      fileName = file.name;

      const rawEventId = formData.get("eventId");
      eventId = typeof rawEventId === "string" ? rawEventId.trim() : null;

      eventDate = formData.get("eventDate") as string | null;
      location = formData.get("location") as string | null;
      countryCode = formData.get("countryCode") as string | null;
      tournamentType = formData.get("tournamentType") as string | null;
    }

    if (!pdfBuffer) {
      return withCors(
        NextResponse.json(
          { error: "PDF konnte nicht verarbeitet werden" },
          { status: 400 }
        )
      );
    }

    if (!fileName) {
      fileName = "uploaded-results.pdf";
    }

    // NEUER HAUPTMODUS:
    // Import in bestehendes Event
    if (eventId) {
      const result = await importStandingsIntoExistingEvent(databaseUrl, {
        eventId,
        pdfBuffer,
        fileName,
      });

      return withCors(NextResponse.json(result));
    }

    // ALTER FALLBACK-MODUS:
    // Nur falls noch kein bestehendes Event verwendet wird
    if (!eventDate || !location || !countryCode || !tournamentType) {
      return withCors(
        NextResponse.json(
          {
            error:
              "Für den Fallback-Import ohne eventId sind eventDate, location, countryCode und tournamentType Pflichtfelder",
          },
          { status: 400 }
        )
      );
    }

    const result = await importStandingsPdf(databaseUrl, {
      pdfBuffer,
      fileName,
      eventDate: String(eventDate),
      location: String(location),
      countryCode: String(countryCode),
      tournamentType: String(tournamentType),
    });

    return withCors(NextResponse.json(result));
  } catch (error) {
    console.error("Import standings failed:", error);

    return withCors(
      NextResponse.json(
        {
          error: "Import fehlgeschlagen",
          details: String(error),
        },
        { status: 500 }
      )
    );
  }
}