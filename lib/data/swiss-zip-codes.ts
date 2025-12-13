/**
 * Schweizer PLZ-Datenbank
 * Mapping von Postleitzahlen zu Ortsnamen
 * 
 * Enthält die wichtigsten Städte und Orte der Schweiz
 * Für eine vollständige Liste könnte die Swiss Post API integriert werden
 */

export interface ZipCodeEntry {
  zip: string;
  city: string;
  canton: string;
}

/**
 * Hauptdatenbank: PLZ zu Orten
 * Mehrere Orte können dieselbe PLZ haben
 */
export const SWISS_ZIP_CODES: ZipCodeEntry[] = [
  // Zürich
  { zip: '8000', city: 'Zürich', canton: 'ZH' },
  { zip: '8001', city: 'Zürich', canton: 'ZH' },
  { zip: '8002', city: 'Zürich', canton: 'ZH' },
  { zip: '8003', city: 'Zürich', canton: 'ZH' },
  { zip: '8004', city: 'Zürich', canton: 'ZH' },
  { zip: '8005', city: 'Zürich', canton: 'ZH' },
  { zip: '8006', city: 'Zürich', canton: 'ZH' },
  { zip: '8008', city: 'Zürich', canton: 'ZH' },
  { zip: '8032', city: 'Zürich', canton: 'ZH' },
  { zip: '8037', city: 'Zürich', canton: 'ZH' },
  { zip: '8045', city: 'Zürich', canton: 'ZH' },
  { zip: '8050', city: 'Zürich', canton: 'ZH' },
  { zip: '8051', city: 'Zürich', canton: 'ZH' },
  { zip: '8052', city: 'Zürich', canton: 'ZH' },
  { zip: '8053', city: 'Zürich', canton: 'ZH' },
  { zip: '8055', city: 'Zürich', canton: 'ZH' },
  { zip: '8057', city: 'Zürich', canton: 'ZH' },
  
  // Winterthur
  { zip: '8400', city: 'Winterthur', canton: 'ZH' },
  { zip: '8401', city: 'Winterthur', canton: 'ZH' },
  { zip: '8404', city: 'Winterthur', canton: 'ZH' },
  
  // Weitere Zürich Kanton
  { zip: '8600', city: 'Dübendorf', canton: 'ZH' },
  { zip: '8610', city: 'Uster', canton: 'ZH' },
  { zip: '8620', city: 'Wetzikon', canton: 'ZH' },
  { zip: '8630', city: 'Rüti', canton: 'ZH' },
  { zip: '8640', city: 'Rapperswil-Jona', canton: 'ZH' },
  { zip: '8700', city: 'Küsnacht', canton: 'ZH' },
  { zip: '8800', city: 'Thalwil', canton: 'ZH' },
  { zip: '8810', city: 'Horgen', canton: 'ZH' },
  
  // Bern
  { zip: '3000', city: 'Bern', canton: 'BE' },
  { zip: '3001', city: 'Bern', canton: 'BE' },
  { zip: '3003', city: 'Bern', canton: 'BE' },
  { zip: '3004', city: 'Bern', canton: 'BE' },
  { zip: '3005', city: 'Bern', canton: 'BE' },
  { zip: '3006', city: 'Bern', canton: 'BE' },
  { zip: '3007', city: 'Bern', canton: 'BE' },
  { zip: '3008', city: 'Bern', canton: 'BE' },
  { zip: '3010', city: 'Bern', canton: 'BE' },
  { zip: '3011', city: 'Bern', canton: 'BE' },
  { zip: '3012', city: 'Bern', canton: 'BE' },
  { zip: '3013', city: 'Bern', canton: 'BE' },
  { zip: '3014', city: 'Bern', canton: 'BE' },
  { zip: '3015', city: 'Bern', canton: 'BE' },
  
  // Weitere Bern Kanton
  { zip: '3250', city: 'Lyss', canton: 'BE' },
  { zip: '3400', city: 'Burgdorf', canton: 'BE' },
  { zip: '3600', city: 'Thun', canton: 'BE' },
  { zip: '3700', city: 'Spiez', canton: 'BE' },
  { zip: '3800', city: 'Interlaken', canton: 'BE' },
  { zip: '2500', city: 'Biel/Bienne', canton: 'BE' },
  { zip: '2501', city: 'Biel/Bienne', canton: 'BE' },
  { zip: '2502', city: 'Biel/Bienne', canton: 'BE' },
  
  // Basel
  { zip: '4000', city: 'Basel', canton: 'BS' },
  { zip: '4001', city: 'Basel', canton: 'BS' },
  { zip: '4002', city: 'Basel', canton: 'BS' },
  { zip: '4051', city: 'Basel', canton: 'BS' },
  { zip: '4052', city: 'Basel', canton: 'BS' },
  { zip: '4053', city: 'Basel', canton: 'BS' },
  { zip: '4054', city: 'Basel', canton: 'BS' },
  { zip: '4055', city: 'Basel', canton: 'BS' },
  { zip: '4056', city: 'Basel', canton: 'BS' },
  { zip: '4057', city: 'Basel', canton: 'BS' },
  
  // Basel-Landschaft
  { zip: '4102', city: 'Binningen', canton: 'BL' },
  { zip: '4103', city: 'Bottmingen', canton: 'BL' },
  { zip: '4132', city: 'Muttenz', canton: 'BL' },
  { zip: '4133', city: 'Pratteln', canton: 'BL' },
  { zip: '4142', city: 'Münchenstein', canton: 'BL' },
  { zip: '4153', city: 'Reinach', canton: 'BL' },
  { zip: '4410', city: 'Liestal', canton: 'BL' },
  
  // Genf
  { zip: '1200', city: 'Genève', canton: 'GE' },
  { zip: '1201', city: 'Genève', canton: 'GE' },
  { zip: '1202', city: 'Genève', canton: 'GE' },
  { zip: '1203', city: 'Genève', canton: 'GE' },
  { zip: '1204', city: 'Genève', canton: 'GE' },
  { zip: '1205', city: 'Genève', canton: 'GE' },
  { zip: '1206', city: 'Genève', canton: 'GE' },
  { zip: '1207', city: 'Genève', canton: 'GE' },
  { zip: '1208', city: 'Genève', canton: 'GE' },
  { zip: '1209', city: 'Genève', canton: 'GE' },
  { zip: '1211', city: 'Genève', canton: 'GE' },
  { zip: '1212', city: 'Genève', canton: 'GE' },
  { zip: '1213', city: 'Petit-Lancy', canton: 'GE' },
  { zip: '1214', city: 'Vernier', canton: 'GE' },
  { zip: '1215', city: 'Genève', canton: 'GE' },
  { zip: '1216', city: 'Cointrin', canton: 'GE' },
  { zip: '1217', city: 'Meyrin', canton: 'GE' },
  { zip: '1218', city: 'Le Grand-Saconnex', canton: 'GE' },
  { zip: '1219', city: 'Châtelaine', canton: 'GE' },
  { zip: '1220', city: 'Les Avanchets', canton: 'GE' },
  
  // Lausanne (Waadt)
  { zip: '1000', city: 'Lausanne', canton: 'VD' },
  { zip: '1001', city: 'Lausanne', canton: 'VD' },
  { zip: '1002', city: 'Lausanne', canton: 'VD' },
  { zip: '1003', city: 'Lausanne', canton: 'VD' },
  { zip: '1004', city: 'Lausanne', canton: 'VD' },
  { zip: '1005', city: 'Lausanne', canton: 'VD' },
  { zip: '1006', city: 'Lausanne', canton: 'VD' },
  { zip: '1007', city: 'Lausanne', canton: 'VD' },
  { zip: '1008', city: 'Prilly', canton: 'VD' },
  { zip: '1010', city: 'Lausanne', canton: 'VD' },
  { zip: '1011', city: 'Lausanne', canton: 'VD' },
  { zip: '1012', city: 'Lausanne', canton: 'VD' },
  
  // Weitere Waadt
  { zip: '1020', city: 'Renens', canton: 'VD' },
  { zip: '1400', city: 'Yverdon-les-Bains', canton: 'VD' },
  { zip: '1800', city: 'Vevey', canton: 'VD' },
  { zip: '1820', city: 'Montreux', canton: 'VD' },
  
  // Luzern
  { zip: '6000', city: 'Luzern', canton: 'LU' },
  { zip: '6003', city: 'Luzern', canton: 'LU' },
  { zip: '6004', city: 'Luzern', canton: 'LU' },
  { zip: '6005', city: 'Luzern', canton: 'LU' },
  { zip: '6006', city: 'Luzern', canton: 'LU' },
  { zip: '6010', city: 'Kriens', canton: 'LU' },
  { zip: '6020', city: 'Emmenbrücke', canton: 'LU' },
  
  // St. Gallen
  { zip: '9000', city: 'St. Gallen', canton: 'SG' },
  { zip: '9001', city: 'St. Gallen', canton: 'SG' },
  { zip: '9004', city: 'St. Gallen', canton: 'SG' },
  { zip: '9006', city: 'St. Gallen', canton: 'SG' },
  { zip: '9007', city: 'St. Gallen', canton: 'SG' },
  { zip: '9008', city: 'St. Gallen', canton: 'SG' },
  { zip: '9010', city: 'St. Gallen', canton: 'SG' },
  
  // Lugano (Tessin)
  { zip: '6900', city: 'Lugano', canton: 'TI' },
  { zip: '6901', city: 'Lugano', canton: 'TI' },
  { zip: '6902', city: 'Lugano', canton: 'TI' },
  { zip: '6903', city: 'Lugano', canton: 'TI' },
  { zip: '6904', city: 'Lugano', canton: 'TI' },
  
  // Weitere wichtige Städte
  { zip: '5000', city: 'Aarau', canton: 'AG' },
  { zip: '7000', city: 'Chur', canton: 'GR' },
  { zip: '1700', city: 'Freiburg', canton: 'FR' },
  { zip: '2000', city: 'Neuchâtel', canton: 'NE' },
  { zip: '6300', city: 'Zug', canton: 'ZG' },
  { zip: '4500', city: 'Solothurn', canton: 'SO' },
  { zip: '8200', city: 'Schaffhausen', canton: 'SH' },
  { zip: '9500', city: 'Wil', canton: 'SG' },
];

/**
 * Schnelles Lookup: Gibt alle Orte für eine PLZ zurück
 */
export function getValidCitiesForZip(zip: string): string[] {
  return SWISS_ZIP_CODES
    .filter(entry => entry.zip === zip)
    .map(entry => entry.city);
}

/**
 * Prüft ob eine PLZ existiert
 */
export function isValidZip(zip: string): boolean {
  return SWISS_ZIP_CODES.some(entry => entry.zip === zip);
}

/**
 * Prüft ob Ort und PLZ zusammenpassen
 */
export function validateZipCityMatch(zip: string, city: string): boolean {
  const normalizedCity = city.trim().toLowerCase();
  
  return SWISS_ZIP_CODES.some(
    entry => entry.zip === zip && entry.city.toLowerCase() === normalizedCity
  );
}

/**
 * Gibt Kantonsabkürzung für PLZ zurück
 */
export function getCantonForZip(zip: string): string | null {
  const entry = SWISS_ZIP_CODES.find(e => e.zip === zip);
  return entry ? entry.canton : null;
}

/**
 * Fuzzy Search: Findet ähnliche Ortsnamen
 * Hilfreich für Auto-Complete und Vorschläge
 */
export function searchCities(query: string, maxResults: number = 10): ZipCodeEntry[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  
  // Exakte Matches zuerst
  const exactMatches = SWISS_ZIP_CODES.filter(
    entry => entry.city.toLowerCase() === normalizedQuery
  );
  
  // Dann Matches die mit dem Query starten
  const startMatches = SWISS_ZIP_CODES.filter(
    entry => 
      entry.city.toLowerCase().startsWith(normalizedQuery) &&
      !exactMatches.includes(entry)
  );
  
  // Dann Matches die den Query enthalten
  const containsMatches = SWISS_ZIP_CODES.filter(
    entry => 
      entry.city.toLowerCase().includes(normalizedQuery) &&
      !exactMatches.includes(entry) &&
      !startMatches.includes(entry)
  );
  
  return [...exactMatches, ...startMatches, ...containsMatches].slice(0, maxResults);
}

/**
 * Sucht PLZ basierend auf Ortsnamen
 */
export function searchZipsByCity(city: string): string[] {
  const normalizedCity = city.trim().toLowerCase();
  
  return SWISS_ZIP_CODES
    .filter(entry => entry.city.toLowerCase().includes(normalizedCity))
    .map(entry => entry.zip);
}
