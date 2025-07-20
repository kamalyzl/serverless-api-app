export interface PlanetWeatherData {
    character: {
        name: string;
        homeworld: string;
    };
    planet: {
        name: string;
        climate: string;
        terrain: string;
        population: string;
    };
    weather: {
        temperature: number;
        windspeed: number;
    };
}