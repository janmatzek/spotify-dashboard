import { ContentSelection } from '../enums/contentSelector'
import BarChartContainer from '../charts/period/BarChartContainer'
import DoughnutChart from '../charts/period/Doughnut'
import ScorecardContainer from '../charts/period/ScorecardContainer'
import SongsTable from '../charts/period/SongsTable'
import { Box, Flex, Wrap, WrapItem } from '@chakra-ui/react'
import {
    PIE_RELEASE_YEARS_URL,
    PIE_CONTEXT_URL,
    PIE_ARISTS_URL,
} from '../utils/constants'

const PageTracks = ({ timeframe }: { timeframe: ContentSelection }) => {
    return (
        <>
            <ScorecardContainer timeframe={timeframe} />
            <Wrap spacing={4} className="trackDataElements" justify="center">
                <WrapItem
                    width={{ base: '100%', md: 'calc(50% - 20px)' }}
                    minWidth={['400px', '500px']}
                >
                    <Flex
                        direction="column"
                        alignItems="center"
                        width="100%"
                        minWidth={['400px', '500px']}
                    >
                        <Wrap
                            spacing={4}
                            justify="center"
                            className="doughnuts-container"
                            width="100%"
                        >
                            <WrapItem
                                width={['150px', '200px']}
                                minHeight={['150px', '200px']}
                            >
                                <DoughnutChart
                                    title="CONTEXT"
                                    url={PIE_CONTEXT_URL + timeframe}
                                />
                            </WrapItem>
                            <WrapItem
                                width={['150px', '200px']}
                                minHeight={['150px', '200px']}
                            >
                                <DoughnutChart
                                    title="ARTISTS"
                                    url={PIE_ARISTS_URL + timeframe}
                                />
                            </WrapItem>
                            <WrapItem
                                width={['150px', '200px']}
                                minHeight={['150px', '200px']}
                            >
                                <DoughnutChart
                                    title="DECADES"
                                    url={PIE_RELEASE_YEARS_URL + timeframe}
                                />
                            </WrapItem>
                        </Wrap>
                        <Box mt={4} minWidth={['300px', '500px']} width="90%">
                            <BarChartContainer timeframe={timeframe} />
                        </Box>
                    </Flex>
                </WrapItem>
                <WrapItem
                    width={{ base: '100%', md: 'calc(50% - 20px)' }}
                    minWidth={['400px', '500px']}
                >
                    <SongsTable timeframe={timeframe} />
                </WrapItem>
            </Wrap>
        </>
    )
}

export default PageTracks
