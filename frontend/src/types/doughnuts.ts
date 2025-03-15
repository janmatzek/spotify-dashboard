import { z } from 'zod'

export const DoughnutDataSchema = z.object({
    // TODO: this should not be null once the data is cleaned up
    category: z.nullable(z.string()),
    value: z.number(),
})

export const DoughnutDataArraySchema = z.array(DoughnutDataSchema)

// Generate types
export type DoughnutData = z.infer<typeof DoughnutDataSchema>
export type DoughnutDataArray = z.infer<typeof DoughnutDataArraySchema>
