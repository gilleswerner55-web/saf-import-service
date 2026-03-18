import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { importStandingsPdf } from "../lib/import-standings";

dotenv.config();

const app = express();
const upload = multer();

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/import-standings", upload.single("file"), async (req, res) => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: "DATABASE_URL fehlt" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Keine PDF-Datei hochgeladen" });
    }

    const { eventDate, location, countryCode, tournamentType } = req.body;

    if (!eventDate || !location || !countryCode || !tournamentType) {
      return res.status(400).json({
        error: "eventDate, location, countryCode und tournamentType sind Pflichtfelder",
      });
    }

    const result = await importStandingsPdf(databaseUrl, {
      pdfBuffer: req.file.buffer,
      fileName: req.file.originalname,
      eventDate,
      location,
      countryCode,
      tournamentType,
    });

    return res.json(result);
  } catch (error) {
    console.error("Import API Fehler:", error);
    return res.status(500).json({
      error: "Import fehlgeschlagen",
      details: String(error),
    });
  }
});

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`Import service läuft auf http://localhost:${port}`);
});
