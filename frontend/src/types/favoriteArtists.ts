import { z } from 'zod'

export const FavoriteArtistsDataSchema = z.object({
    name: z.string(),
    main_genre: z.nullable(z.string()),
    genres: z.string(),
    popularity: z.number(),
    images_url: z.string(),
    external_urls_spotify: z.string(),
    count_tracks: z.number(),
})

export const FavoriteArtistsDataArraySchema = z.array(FavoriteArtistsDataSchema)

export type FavoriteArtistsData = z.infer<typeof FavoriteArtistsDataSchema>
export type FavoriteArtistsDataArray = z.infer<
    typeof FavoriteArtistsDataArraySchema
>
