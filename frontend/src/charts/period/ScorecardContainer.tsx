import React, { useState, useEffect } from 'react'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { Heading, Flex, Wrap, WrapItem } from '@chakra-ui/react'
import { SCORECARDS_URL } from '../../utils/constants'
import { ContentSelection } from '../../enums/contentSelector'
import {
    ScorecardsDataSchema,
    Scorecard,
    ScorecardValue,
} from '../../types/scorecards'
import { ApiClient } from '../../utils/apiClient'

const SPINNER_SIZE = 'md'
const SPINNER_COLOR = 'gray.400'

const ScorecardContainer = ({ timeframe }: { timeframe: ContentSelection }) => {
    const [scorecardData, setScorecardData] = useState<Scorecard[]>([
        { id: 1, title: 'TRACKS 🎧', value: null },
        { id: 2, title: 'UNIQUE 🎵', value: null },
        { id: 3, title: 'ARTISTS 🎤', value: null },
        { id: 4, title: 'LISTENING 🕜', value: null },
        { id: 5, title: 'BB INDEX 🎉', value: null },
    ])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    function formatDuration(milliseconds: number) {
        let totalSeconds = Math.floor(milliseconds / 1000)
        let days = Math.floor(totalSeconds / 86400) // 86400 seconds in a day
        totalSeconds %= 86400
        let hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        let minutes = Math.floor(totalSeconds / 60)
        let seconds = totalSeconds % 60

        // Format the result as "d:hh:mm:ss" or "hh:mm:ss" if days is 0
        return `${days > 0 ? days + ':' : ''}${hours
            .toString()
            .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

    const fetchScorecardDataFromAPI = async () => {
        try {
            const rawData = await ApiClient.fetchFromBackend(
                SCORECARDS_URL + timeframe
            )
            const data = ScorecardsDataSchema.parse(rawData)

            // TODO: do this smarter
            const chartData: Scorecard[] = [
                { id: 1, title: 'TRACKS 🎧', value: data.count_tracks },
                {
                    id: 2,
                    title: 'UNIQUE 🎵',
                    value: data.distinct_tracks,
                },
                {
                    id: 3,
                    title: 'ARTISTS 🎤',
                    value: data.count_artists,
                },
                {
                    id: 4,
                    title: 'LISTENING 🕜',
                    value: formatDuration(data.total_duration_ms),
                },
                {
                    id: 5,
                    title: 'BB INDEX 🎉',
                    value: Math.round(data.avg_popularity),
                },
            ]
            return chartData
        } catch (error) {
            console.error(
                'There was a problem with the fetch operation:',
                error
            )
            throw error
        }
    }

    useEffect(() => {
        const fetchScorecardData = async () => {
            setLoading(true)
            try {
                const data = await fetchScorecardDataFromAPI()
                setScorecardData(data)
                setLoading(false)
            } catch (error: any) {
                setError(error)
                setLoading(false)
            }
        }
        fetchScorecardData()
    }, [timeframe])

    const ScorecardTitle = ({ title }: { title: string }) => {
        return (
            <Heading as="h2" size={['xs', 'sm']} paddingTop="10px">
                {title}
            </Heading>
        )
    }

    const ScorecardValue = ({ value }: { value: ScorecardValue }) => {
        return (
            <Heading as="h3" size="xs" paddingTop="10px" color="gray">
                {value}
            </Heading>
        )
    }
    const ScorecardWrapItem = ({ scorecard }: { scorecard: Scorecard }) => {
        return (
            <WrapItem>
                <Flex className="scorecard" width={['135px', '160px']}>
                    <ScorecardTitle title={scorecard.title} />
                    {loading ? (
                        <Flex marginTop="10px">
                            <LoadingIndicator
                                size={SPINNER_SIZE}
                                color={SPINNER_COLOR}
                            />
                        </Flex>
                    ) : (
                        <ScorecardValue value={scorecard.value} />
                    )}
                </Flex>
            </WrapItem>
        )
    }

    return (
        <Flex justify="center" padding="20px" className="scorecard-container">
            {error && <div>Error fetching scorecards: {error.message}</div>}
            <Wrap spacing="20px" justify="center">
                {scorecardData.map((item) => (
                    <ScorecardWrapItem key={item.id} scorecard={item} />
                ))}
            </Wrap>
        </Flex>
    )
}

export default ScorecardContainer
