import { NextRequest, NextResponse } from "next/server";
import { importStandingsPdf } from "@/lib/import-standings";
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

/* =========================
   🔐 AUTH HELPERS
   (vorerst drin gelassen, aber aktuell nicht verwendet)
========================= */

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

/* =========================
   🚀 MAIN ENDPOINT
========================= */

export async function POST(request: NextRequest) {
  // TEMPORÄR AUTH DISABLED FOR TESTING
  // const user = await getUserFromRequest(request);
  //
  // if (!user) {
  //   return withCors(
  //     NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   );
  // }
  //
  // const isAdmin = await isSuperAdmin(user.id);
  //
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

    const formData = await request.formData();

    const pdfUrl = formData.get("pdfUrl");
    const fileName = formData.get("fileName");
    const eventDate = formData.get("eventDate");
    const location = formData.get("location");
    const countryCode = formData.get("countryCode");
    const tournamentType = formData.get("tournamentType");

    if (!pdfUrl || typeof pdfUrl !== "string") {
      return withCors(
        NextResponse.json(
          { error: "Keine PDF-URL angegeben" },
          { status: 400 }
        )
      );
    }

    if (!eventDate || !location || !countryCode || !tournamentType) {
      return withCors(
        NextResponse.json(
          {
            error:
              "eventDate, location, countryCode und tournamentType sind Pflichtfelder",
          },
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

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("pdf")) {
      return withCors(
        NextResponse.json(
          { error: "Die angegebene Datei ist keine PDF" },
          { status: 400 }
        )
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const derivedFileName =
      typeof fileName === "string" && fileName.trim().length > 0
        ? fileName
        : pdfUrl.split("/").pop() || "uploaded-results.pdf";

    const result = await importStandingsPdf(databaseUrl, {
      pdfBuffer,
      fileName: derivedFileName,
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