import { z } from 'zod'

export const BarChartDataSchema = z.object({
    hour: z.number(),
    count: z.number(),
})
export const BarChartDataArraySchema = z.array(BarChartDataSchema)

export type BarChartData = z.infer<typeof BarChartDataSchema>
export type BarChartDataArray = z.infer<typeof BarChartDataArraySchema>

export interface BarChartInput {
    labels: number[]
    datasets: BarChartDataset[]
}

export interface BarChartDataset {
    label: string
    backgroundColor: string
    borderColor: string
    borderWidth: number
    hoverBackgroundColor: string
    hoverBorderColor: string
    data: number[]
}

export interface BarChartOptions {
    scales: {
        x: {
            type: 'category'
            title: {
                display: boolean
                text: string
            }
            maxTicksLimit: number
        }
        y: {
            title: {
                display: boolean
                text: string
            }
        }
    }
    plugins: {
        legend: {
            display: boolean
        }
    }
}
