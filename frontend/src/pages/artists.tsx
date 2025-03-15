import FavoriteArtists from '../charts/artists_and_genres/FavoriteArtists'
import GenresBarChart from '../charts/artists_and_genres/GenresBar'
import { Wrap, WrapItem } from '@chakra-ui/react'

const PageArtists = () => {
    return (
        <Wrap
            spacing={4}
            className="artists-genre-page"
            justify="center"
            mt={1}
        >
            <WrapItem
                width={{ base: '100%', md: 'calc(50% - 20px)' }}
                minWidth={['400px', '550px']}
            >
                <FavoriteArtists />
            </WrapItem>
            <WrapItem
                width={{ base: '100%', md: 'calc(50% - 20px)' }}
                minWidth={['400px', '550px']}
            >
                <GenresBarChart />
            </WrapItem>
        </Wrap>
    )
}

export default PageArtists
