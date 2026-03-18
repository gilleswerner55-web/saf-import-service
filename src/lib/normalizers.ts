export function normalizePersonName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeCountryCode(
  rawCountry: string | null | undefined
): string | null {
  if (!rawCountry) return null;

  const value = rawCountry.toLowerCase().trim();

  if (["switzerland", "swiss", "schweiz", "sui", "ch"].includes(value)) return "CH";
  if (["austria", "aut", "at"].includes(value)) return "AT";
  if (["germany", "deutschland", "ger", "de"].includes(value)) return "DE";
  if (["france", "fra", "fr"].includes(value)) return "FR";
  if (["italy", "ita", "it"].includes(value)) return "IT";

  return rawCountry.toUpperCase();
}
