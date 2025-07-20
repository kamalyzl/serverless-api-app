export interface SwapiService {
  getCharacter(id: number): Promise<{ name: string; homeworld: string }>;
  getPlanetDataFromUrl(homeworldUrl: string): Promise<{ name: string; climate: string; terrain: string; population: string }>;
}
