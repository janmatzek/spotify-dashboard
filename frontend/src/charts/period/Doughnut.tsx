import React, { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { Heading } from '@chakra-ui/react'
import { Chart, ArcElement } from 'chart.js'
import {
    DoughnutDataArray,
    DoughnutData,
    DoughnutDataArraySchema,
} from '../../types/doughnuts'
Chart.register(ArcElement)
import { ApiClient } from '../../utils/apiClient'

const DoughnutChart = ({ title, url }: { title: string; url: string }) => {
    const [doughnutData, setDoughnutData] = useState<DoughnutDataArray>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#9966CC', '#FFA07A']

    useEffect(() => {
        const fetchDoughnutDataFromAPI = async (
            url: string
        ): Promise<DoughnutData[]> => {
            try {
                const rawData = await ApiClient.fetchFromBackend(url)
                const data = DoughnutDataArraySchema.parse(rawData)
                return data
            } catch (error: unknown) {
                throw new Error(
                    `Error fetching data: ${(error as Error).message}`
                )
            }
        }

        setError(null)
        setLoading(true)

        fetchDoughnutDataFromAPI(url)
            .then((data) => {
                setDoughnutData(data)
                setLoading(false)
            })
            .catch((error) => {
                setError(error)
                setLoading(false)
            })
    }, [url])

    const options = {
        plugins: {
            legend: {
                display: false,
            },
        },
    }

    const DoughnutTitle = ({ title }: { title: string }) => {
        return (
            <Heading
                as="h2"
                size={['xs', 'sm']}
                paddingTop="10px"
                paddingBottom="2.5vh"
                marginBottom={loading ? '7.5vh' : '2.5vh'}
            >
                {title}
            </Heading>
        )
    }

    return (
        <div className={`doughnut-chart ${loading ? 'loading' : ''}`}>
            <DoughnutTitle title={title} />
            {loading ? (
                <LoadingIndicator />
            ) : (
                <Doughnut
                    data={{
                        labels: doughnutData.map((item) => item.category),
                        datasets: [
                            {
                                data: doughnutData.map((item) => item.value),
                                backgroundColor: colors,
                                hoverBackgroundColor: colors,
                            },
                        ],
                    }}
                    options={options}
                />
            )}
            {error && <div>Error fetching doughnut chart: {error.message}</div>}
        </div>
    )
}

export default DoughnutChart
