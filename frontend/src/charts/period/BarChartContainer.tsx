import { Chart, CategoryScale } from 'chart.js/auto'
import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Heading, Stack, Flex } from '@chakra-ui/react'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { BARS_URL } from '../../utils/constants'
import { ContentSelection } from '../../enums/contentSelector'
import {
    BarChartData,
    BarChartDataArraySchema,
    BarChartInput,
    BarChartOptions,
} from '../../types/activityBarChart'
import { ApiClient } from '../../utils/apiClient'

Chart.register(CategoryScale)

const BarChartContainer = ({ timeframe }: { timeframe: ContentSelection }) => {
    const [barChartData, setBarChartData] = useState<BarChartInput>({
        labels: [],
        datasets: [],
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const [timezoneOffset, setTimezoneOffset] = useState<number>(0)
    const [periodName, setPeriodName] = useState('Last 24 hours')

    useEffect(() => {
        const userTimezoneOffset = new Date().getTimezoneOffset() / 60
        setTimezoneOffset(userTimezoneOffset)
    }, [])

    useEffect(() => {
        setLoading(true)
        setPeriodName(timeframe === 'last_24' ? 'Last 24 hours' : 'All time')
        fetchBarChartData()
    }, [timezoneOffset, timeframe])

    const fetchBarChartData = async () => {
        try {
            const rawData = await ApiClient.fetchFromBackend(
                BARS_URL + timeframe
            )
            const data = BarChartDataArraySchema.parse(rawData)

            const adjustedLabels = data.map((item: BarChartData) => {
                let adjustedHour = item.hour - timezoneOffset
                if (adjustedHour < 0) {
                    adjustedHour += 24
                } else if (adjustedHour >= 24) {
                    adjustedHour -= 24
                }
                return adjustedHour
            })
            const counts = data.map((item: BarChartData) => item.count)

            // Create combined data for sorting
            const combinedData = adjustedLabels.map((label, index) => ({
                label,
                count: counts[index],
            }))

            let sortedData

            if (timeframe === 'last_24') {
                // Sort from current hour onwards, then wrap around
                const currentHour = new Date().getHours()

                sortedData = combinedData.sort((a, b) => {
                    // Create a "distance from current hour" for each hour
                    const getDistance = (hour: number) => {
                        if (hour >= currentHour) {
                            return hour - currentHour // Hours ahead today
                        } else {
                            return 24 - currentHour + hour // Hours from tomorrow
                        }
                    }

                    return getDistance(a.label) - getDistance(b.label)
                })
            } else {
                // All time: regular hour sorting (0-23)
                sortedData = combinedData.sort((a, b) => a.label - b.label)
            }

            setBarChartData({
                labels: sortedData.map((item) => item.label),
                datasets: [
                    {
                        label: 'Track Count',
                        backgroundColor: 'rgba(237, 110, 133, 0.2)',
                        borderColor: 'rgba(237, 110, 133, 1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(237, 110, 133, 0.4)',
                        hoverBorderColor: 'rgba(237, 110, 133, 1)',
                        data: sortedData.map((item) => item.count),
                    },
                ],
            })

            setLoading(false)
        } catch (error) {
            setError(error as Error)
            setLoading(false)
        }
    }

    const options: BarChartOptions = {
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Hour Played At',
                },
                maxTicksLimit: 24,
            },
            y: {
                title: {
                    display: false,
                    text: 'Track Count',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    }

    return (
        <Stack className="bar-chart-container">
            <Heading
                as="h2"
                size={['xs', 'sm']}
                paddingTop="1vh"
                paddingBottom="2vh"
            >
                LISTENING TIME ({periodName})
            </Heading>
            {loading && (
                <Flex marginTop="15vh" marginLeft={['40vw', '22vw']}>
                    <LoadingIndicator />
                </Flex>
            )}
            {error && <div>Error: {error.message}</div>}
            {!loading && !error && (
                <React.Fragment>
                    <Bar data={barChartData} options={options} />
                </React.Fragment>
            )}
        </Stack>
    )
}

export default BarChartContainer
