export interface Character {
  name: string;
  homeworld: string;
}

export interface Planet {
  name: string;
  climate: string;
  terrain: string;
  population: string;
}

export interface Weather {
  temperature: number;
  windspeed: number;
}

export interface PlanetWeatherRecord {
  id: string; // UUID o timestamp como identificador
  character: Character;
  planet: Planet;
  weather: Weather;
  createdAt: string; // ISO
}
