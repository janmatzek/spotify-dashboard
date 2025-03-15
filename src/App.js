import React, { useState } from "react";
import "./App.css"; // Import your CSS file for styling
import BarChartContainer from "./BarChartContainer"; // Import BarChartContainer component
import DoughnutChart from "./Doughnut.js";
import ScorecardContainer from "./ScorecardContainer"; // Import ScorecardContainer component
import DataTable from "./DataTable"; // Import DataTable component
import FavoriteArtists from "./FavoriteArtists";
import GenresBarChart from "./GenresBar";
import { Select, Box, Flex, Wrap, WrapItem } from "@chakra-ui/react";

function App() {
  const [dropdownValue, setDropdownValue] = useState("last_24");

  const handleSelectChange = (event) => {
    setDropdownValue(event.target.value);
  };

  return (
    <Box className="app-container">
      <Flex className="nav">
        <Box className="periodSelector">
          <Select value={dropdownValue} onChange={handleSelectChange}>
            <option value="last_24">Last 24 hours</option>
            <option value="all_time">All time average</option>
            <option value="artists">Artists & genres</option>
          </Select>
        </Box>
      </Flex>

      {dropdownValue !== "artists" && (
        <ScorecardContainer timeframe={dropdownValue} />
      )}

      {dropdownValue !== "artists" && (
        <Wrap spacing={4} className="trackDataElements" justify="center">
          <WrapItem
            width={{ base: "100%", md: "calc(50% - 20px)" }}
            minWidth={["400px", "500px"]}
          >
            <Flex
              direction="column"
              alignItems="center"
              width="100%"
              minWidth={["400px", "500px"]}
            >
              <Wrap
                spacing={4}
                justify="center"
                className="doughnuts-container"
                width="100%"
              >
                <WrapItem
                  width={["150px", "200px"]}
                  minHeight={["150px", "200px"]}
                >
                  <DoughnutChart
                    title="CONTEXT"
                    url={process.env.REACT_APP_PIE_CONTEXT_URL + dropdownValue}
                  />
                </WrapItem>
                <WrapItem
                  width={["150px", "200px"]}
                  minHeight={["150px", "200px"]}
                >
                  <DoughnutChart
                    title="ARTISTS"
                    url={process.env.REACT_APP_PIE_ARISTS_URL + dropdownValue}
                  />
                </WrapItem>
                <WrapItem
                  width={["150px", "200px"]}
                  minHeight={["150px", "200px"]}
                >
                  <DoughnutChart
                    title="DECADES"
                    url={
                      process.env.REACT_APP_PIE_RELEASE_YEARS_URL +
                      dropdownValue
                    }
                  />
                </WrapItem>
              </Wrap>
              <Box mt={4} minWidth={["300px", "500px"]} width="90%">
                <BarChartContainer timeframe={dropdownValue} />
              </Box>
            </Flex>
          </WrapItem>
          <WrapItem
            width={{ base: "100%", md: "calc(50% - 20px)" }}
            minWidth={["400px", "500px"]}
          >
            <DataTable timeframe={dropdownValue} />
          </WrapItem>
        </Wrap>
      )}

      {dropdownValue === "artists" && (
        <Wrap
          spacing={4}
          className="artists-genre-page"
          justify="center"
          mt={1}
        >
          <WrapItem
            width={{ base: "100%", md: "calc(50% - 20px)" }}
            minWidth={["400px", "550px"]}
          >
            <FavoriteArtists />
          </WrapItem>
          <WrapItem
            width={{ base: "100%", md: "calc(50% - 20px)" }}
            minWidth={["400px", "550px"]}
          >
            <GenresBarChart />
          </WrapItem>
        </Wrap>
      )}
    </Box>
  );
}

export default App;
