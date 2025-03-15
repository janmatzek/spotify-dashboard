import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td, Link, Flex } from '@chakra-ui/react'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { TABLE_URL } from '../../utils/constants'
import { ContentSelection } from '../../enums/contentSelector'
import {
    SongsTableDataArray,
    SongsTableDataArraySchema,
} from '../../types/songsTable'
import { ApiClient } from '../../utils/apiClient'

const SongsTable = ({ timeframe }: { timeframe: ContentSelection }) => {
    const [data, setData] = useState<SongsTableDataArray>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        setLoading(true)
        fetchTableData()
    }, [timeframe])

    const fetchTableData = async () => {
        try {
            const rawData = await ApiClient.fetchFromBackend(
                TABLE_URL + timeframe
            )
            const data = SongsTableDataArraySchema.parse(rawData)
            setData(data)
            setLoading(false)
        } catch (error) {
            setError(error as Error)
            setLoading(false)
        }
    }

    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="table-container">
            {/* <Heading {...headingStyles}>TOP 5 TRACKS</Heading> */}
            {loading ? (
                <Flex marginLeft={['50vw', '25vw']} marginTop="30vh">
                    <LoadingIndicator />
                </Flex>
            ) : (
                <Table variant="simple" size={['xs', 'sm']}>
                    <Thead>
                        <Tr>
                            <Th>TOP 5 TRACKS</Th>
                            <Th>TRACK NAME</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>
                                ALBUM
                            </Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>
                                ARTIST
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((item, index) => (
                            <Tr key={index}>
                                <Td>
                                    <Link href={item.track_url} isExternal>
                                        <img
                                            src={item.album_image_url}
                                            alt={item.album_name}
                                            style={{ maxWidth: '100px' }}
                                        />
                                    </Link>
                                </Td>
                                <Td>
                                    <Link href={item.track_url} isExternal>
                                        {item.track_name}
                                    </Link>
                                </Td>
                                <Td
                                    display={{ base: 'none', md: 'table-cell' }}
                                >
                                    {item.album_name}
                                </Td>
                                <Td
                                    display={{ base: 'none', md: 'table-cell' }}
                                >
                                    {item.artist_name}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </div>
    )
}

export default SongsTable
