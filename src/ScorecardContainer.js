import React, { useState, useEffect } from "react";
import LoadingIndicator from "./LoadingIndicator"; // Import LoadingIndicator component
import { Heading, Flex, Wrap, WrapItem } from "@chakra-ui/react";

const ScorecardContainer = ({ timeframe }) => {
  // State for scorecard data
  const [scorecardData, setScorecardData] = useState([
    { id: 1, title: "TRACKS 🎧", value: null },
    { id: 2, title: "UNIQUE 🎵", value: null },
    { id: 3, title: "ARTISTS 🎤", value: null },
    { id: 4, title: "LISTENING 🕜", value: null },
    { id: 5, title: "BB INDEX 🎉", value: null },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function formatDuration(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let days = Math.floor(totalSeconds / 86400); // 86400 seconds in a day
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Format the result as "d:hh:mm:ss" or "hh:mm:ss" if days is 0
    return `${days > 0 ? days + ":" : ""}${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  const fetchScorecardDataFromAPI = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_SCORECARDS_URL}${timeframe}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      const chartData = [
        { id: 1, title: "TRACKS 🎧", value: responseData.count_tracks },
        { id: 2, title: "UNIQUE 🎵", value: responseData.distinct_tracks },
        { id: 3, title: "ARTISTS 🎤", value: responseData.count_artists },
        {
          id: 4,
          title: "LISTENING 🕜",
          value: formatDuration(responseData.total_duration_ms),
        },
        {
          id: 5,
          title: "BB INDEX 🎉",
          value: Math.round(responseData.avg_popularity),
        },
      ];
      return chartData;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchScorecardData = async () => {
      setLoading(true);
      try {
        const data = await fetchScorecardDataFromAPI();
        setScorecardData(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchScorecardData();
  }, [timeframe]);

  const headingStyles = {
    as: "h2",
    size: ["xs", "sm"],
    paddingTop: "10px",
  };

  const valueStyles = {
    as: "h3",
    size: "xs",
    paddingTop: "10px",
    color: "gray",
  };

  const spinnerSize = "md";
  const spinnerColor = "gray.400";

  return (
    <Flex justify="center" padding="20px" className="scorecard-container">
      {error && <div>Error fetching scorecards: {error.message}</div>}
      <Wrap spacing="20px" justify="center">
        {/* Render each WrapItem individually */}
        <WrapItem key={1}>
          <Flex className="scorecard" width={["135px", "160px"]}>
            <Heading {...headingStyles}>{scorecardData[0].title}</Heading>
            {loading ? (
              <Flex marginTop="10px">
                <LoadingIndicator size={spinnerSize} color={spinnerColor} />
              </Flex>
            ) : (
              <Heading {...valueStyles}>{scorecardData[0].value}</Heading>
            )}
          </Flex>
        </WrapItem>
        <WrapItem key={2}>
          <Flex className="scorecard" width={["135px", "160px"]}>
            <Heading {...headingStyles}>{scorecardData[1].title}</Heading>
            {loading ? (
              <Flex marginTop="10px">
                <LoadingIndicator size={spinnerSize} color={spinnerColor} />
              </Flex>
            ) : (
              <Heading {...valueStyles}>{scorecardData[1].value}</Heading>
            )}
          </Flex>
        </WrapItem>
        <WrapItem key={3}>
          <Flex className="scorecard" width={["135px", "160px"]}>
            <Heading {...headingStyles}>{scorecardData[2].title}</Heading>
            {loading ? (
              <Flex marginTop="10px">
                <LoadingIndicator size={spinnerSize} color={spinnerColor} />
              </Flex>
            ) : (
              <Heading {...valueStyles}>{scorecardData[2].value}</Heading>
            )}
          </Flex>
        </WrapItem>
        <WrapItem key={4}>
          <Flex className="scorecard" width={["135px", "160px"]}>
            <Heading {...headingStyles}>{scorecardData[3].title}</Heading>
            {loading ? (
              <Flex marginTop="10px">
                <LoadingIndicator size={spinnerSize} color={spinnerColor} />
              </Flex>
            ) : (
              <Heading {...valueStyles}>{scorecardData[3].value}</Heading>
            )}
          </Flex>
        </WrapItem>
        <WrapItem key={5}>
          <Flex className="scorecard" width={["135px", "160px"]}>
            <Heading {...headingStyles}>{scorecardData[4].title}</Heading>
            {loading ? (
              <Flex marginTop="10px">
                <LoadingIndicator size={spinnerSize} color={spinnerColor} />
              </Flex>
            ) : (
              <Heading {...valueStyles}>{scorecardData[4].value}</Heading>
            )}
          </Flex>
        </WrapItem>
      </Wrap>
    </Flex>
  );
};

export default ScorecardContainer;
