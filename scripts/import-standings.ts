import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { importStandingsPdf } from "../src/lib/import-standings";

dotenv.config();

console.log("SCRIPT STARTET");

async function run() {
  console.log("🚀 Import gestartet");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL fehlt in deiner .env Datei");
  }

  const fileName = "Standings_ZürichCup_2026.pdf";
  const pdfPath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF nicht gefunden: ${pdfPath}`);
  }

  console.log("📄 PDF gefunden:", pdfPath);

  const pdfBuffer = fs.readFileSync(pdfPath);

  const result = await importStandingsPdf(databaseUrl, {
    pdfBuffer,
    fileName,
    eventDate: "2026-01-24",
    location: "Zürich",
    countryCode: "CH",
    tournamentType: "national",
  });

  console.log("✅ Import abgeschlossen");
  console.log(result);
}

run().catch((error) => {
  console.error("❌ Fehler:");
  console.error(error);
});
