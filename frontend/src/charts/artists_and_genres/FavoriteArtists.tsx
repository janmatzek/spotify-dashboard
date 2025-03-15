import React, { useState, useEffect } from 'react'
import { Table, Thead, Tbody, Tr, Th, Td, Link, Flex } from '@chakra-ui/react'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { FAVORITE_ARTISTS_URL } from '../../utils/constants'
import {
    FavoriteArtistsDataArray,
    FavoriteArtistsDataArraySchema,
} from '../../types/favoriteArtists'
import { ApiClient } from '../../utils/apiClient'

const FavoriteArtists = () => {
    const [data, setData] = useState<FavoriteArtistsDataArray>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        setLoading(true)
        fetchTableData()
    }, [])

    const fetchTableData = async () => {
        try {
            const rawData =
                await ApiClient.fetchFromBackend(FAVORITE_ARTISTS_URL)
            const data = FavoriteArtistsDataArraySchema.parse(rawData)

            setData(data)
            setLoading(false)
        } catch (error) {
            console.error('Fetch error:', error)
            setError(error as Error)
            setLoading(false)
        }
    }

    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="artists-table-container">
            {/* <Heading {...headingStyles}>TOP 5 TRACKS</Heading> */}
            {loading ? (
                <Flex marginLeft={['50vw', '25vw']} marginTop="30vh">
                    <LoadingIndicator />
                </Flex>
            ) : (
                <Table variant="simple" size={['sm']}>
                    <Thead>
                        <Tr>
                            <Th>TOP 5 ARTISTS</Th>
                            <Th>NAME</Th>
                            <Th>BB INDEX</Th>
                            <Th display={{ base: 'none', md: 'table-cell' }}>
                                GENRE
                            </Th>
                            <Th>TRACKS PLAYED</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((item, index) => (
                            <Tr key={index}>
                                <Td>
                                    <Link
                                        href={item.external_urls_spotify}
                                        isExternal
                                    >
                                        <img
                                            src={item.images_url}
                                            alt={item.name}
                                            style={{ maxWidth: '100px' }}
                                        />
                                    </Link>
                                </Td>
                                <Td>
                                    <Link
                                        href={item.external_urls_spotify}
                                        isExternal
                                    >
                                        {item.name}
                                    </Link>
                                </Td>
                                <Td>{item.popularity}</Td>
                                <Td
                                    display={{ base: 'none', md: 'table-cell' }}
                                >
                                    {item.main_genre}
                                </Td>
                                <Td>{item.count_tracks}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </div>
    )
}

export default FavoriteArtists
