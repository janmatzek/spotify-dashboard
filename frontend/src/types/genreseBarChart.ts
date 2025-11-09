import { z } from 'zod'

export const GenresBarDataSchema = z.object({
    genre: z.string(),
    count_tracks: z.number(),
})
export const GenresBarDataArraySchema = z.array(GenresBarDataSchema)

export type GenresBarData = z.infer<typeof GenresBarDataSchema>
export type GenresBarDataArray = z.infer<typeof GenresBarDataArraySchema>
