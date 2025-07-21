import { z } from "zod";

export const CreatePlanetWeatherDTOSchema = z.object({
    characterName: z.string().min(1),
    planetName: z.string().min(1),
    planetClimate: z.string().min(1),
    planetTerrain: z.string().min(1),
    planetPopulation: z.string().min(1),
    weatherTemperature: z.number(),
    weatherWindspeed: z.number().optional(),
});

export type CreatePlanetWeatherDTO = z.infer<typeof CreatePlanetWeatherDTOSchema>;
