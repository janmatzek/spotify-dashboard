// TODO: fix the chart.js imports
// @ts-ignore
import { Chart } from 'chart.js'
import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { Heading } from '@chakra-ui/react'
import { GENRES_URL } from '../../utils/constants'
import {
    GenresBarDataArray,
    GenresBarDataArraySchema,
} from '../../types/genreseBarChart'
import { ApiClient } from '../../utils/apiClient'

const GenresBarChart = () => {
    const [chartData, setChartData] = useState<GenresBarDataArray>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchChartData()
    }, [])

    const fetchChartData = async () => {
        setLoading(true)
        setError(null)

        try {
            const rawData = await ApiClient.fetchFromBackend(GENRES_URL)
            const data = GenresBarDataArraySchema.parse(rawData)
            setChartData(data)
            setLoading(false)
        } catch (error) {
            setError(error as Error)
            setLoading(false)
        }
    }

    const options = {
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: {
                    display: true,
                    drawBorder: false,
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 0.5,
                    drawTicks: false,
                },
            },
        },
        maintainAspectRatio: false,
        responsive: true,
        // aspectRatio: 3, // Change the aspect ratio to adjust the height
    }

    const BarChartHeading = ({ title }: { title: string }) => {
        return (
            <Heading
                as="h2"
                size={['xs', 'sm']}
                paddingTop="10px"
                paddingBottom="20px"
            >
                {title}
            </Heading>
        )
    }

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#9966CC', '#FFA07A']

    return (
        <div className="genres-bar-chart-container">
            <BarChartHeading title="TOP 20 GENRES" />
            <div className={`genre-bar-chart ${loading ? 'loading' : ''}`}>
                {loading ? (
                    <LoadingIndicator />
                ) : (
                    <Bar
                        data={{
                            labels: chartData.map((item) => item.genre),
                            datasets: [
                                {
                                    label: 'Count',
                                    data: chartData.map(
                                        (item) => item.count_tracks
                                    ),
                                    backgroundColor: colors,
                                    barThickness: 20,
                                },
                            ],
                        }}
                        options={options}
                    />
                )}
            </div>
            {error && <div>Error fetching bar chart data: {error.message}</div>}
        </div>
    )
}

export default GenresBarChart
