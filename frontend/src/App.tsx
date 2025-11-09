import React, { useState } from 'react'
import './css/app.css'
import { Select, Box, Flex } from '@chakra-ui/react'
import { ContentSelection } from './enums/contentSelector'
import PageArtists from './pages/artists'
import PageTracks from './pages/tracks'

function App() {
    const [dropdownValue, setDropdownValue] = useState(ContentSelection.LAST_24)

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setDropdownValue(event.target.value as ContentSelection)
    }

    return (
        // TODO: create separate components for selected pages and move them to separate files to keep this clear
        <Box className="app-container">
            <Flex className="nav">
                <Box className="periodSelector">
                    <Select value={dropdownValue} onChange={handleSelectChange}>
                        <option value={ContentSelection.LAST_24}>
                            Last 24 hours
                        </option>
                        <option value={ContentSelection.ALL_TIME}>
                            All time average
                        </option>
                        <option value={ContentSelection.ARTISTS}>
                            Artists & genres
                        </option>
                    </Select>
                </Box>
            </Flex>

            {dropdownValue !== 'artists' && (
                <PageTracks timeframe={dropdownValue} />
            )}

            {dropdownValue === 'artists' && <PageArtists />}
        </Box>
    )
}

export default App
