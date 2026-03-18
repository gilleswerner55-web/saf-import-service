// Club logo mappings

export const clubLogos: Record<string, string> = {
  'Armwrestling Zürich': '/clubs/armwrestlingzurich.png',
  'LAC': '/clubs/lac.png',
  'Gorillas': '/clubs/gorillas.png',
  'ASC Kobra': '/clubs/asc-kobra.jpeg',
  'Pulling Crew Zürich': '/clubs/pulling-crew-zurich.svg',
  'High Hookers Switzerland': '/clubs/high-hookers-switzerland.jpeg',
  'Armforce Basel': '/clubs/armforce-basel.jpeg',
  'Eagle Grip Geneva': '/clubs/eagle-grip-geneva.png',
  'Bras de fer Neuchatel': '/clubs/bras-de-fer.jpeg',
  'Underground': '/clubs/underground-armsport.jpeg',
  'ASC Taurus': '/clubs/asc-taurus.jpeg',
  'ASC Armpower': '/clubs/asc-armpower.jpeg',
  'ASC Spartans': '/clubs/asc-spartans.jpeg',
  'ASC Wolf': '/clubs/asc-wolf.jpeg',
}

export function getClubLogo(clubName: string): string | null {
  return clubLogos[clubName] || null
}
