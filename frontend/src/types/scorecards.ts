import { z } from 'zod'

export const ScorecardsDataSchema = z.object({
    count_tracks: z.number(),
    distinct_tracks: z.number(),
    count_artists: z.number(),
    total_duration_ms: z.number(),
    avg_popularity: z.number(),
})

export type ScorecardValue = number | string | null

export type Scorecard = {
    id: number
    title: string
    value: ScorecardValue
}
export type ScorecardsData = z.infer<typeof ScorecardsDataSchema>
