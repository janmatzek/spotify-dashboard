import { z } from 'zod'

export const SongsTableSchema = z.object({
    track_name: z.string(),
    track_url: z.string(),
    album_name: z.string(),
    album_image_url: z.string(),
    artist_name: z.string(),
})

export const SongsTableDataArraySchema = z.array(SongsTableSchema)

export type SongsTableData = z.infer<typeof SongsTableSchema>
export type SongsTableDataArray = z.infer<typeof SongsTableDataArraySchema>
