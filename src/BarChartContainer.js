import { Chart } from "chart.js/auto"; // Import Chart directly
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Heading, Stack, Flex } from "@chakra-ui/react";
import LoadingIndicator from "./LoadingIndicator";

const BarChartContainer = ({ timeframe }) => {
  const [barChartData, setBarChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timezoneOffset, setTimezoneOffset] = useState("");
  const [periodName, setPeriodName] = useState("Last 24 hours");

  useEffect(() => {
    const userTimezoneOffset = new Date().getTimezoneOffset() / 60;
    setTimezoneOffset(userTimezoneOffset);
  }, []);

  useEffect(() => {
    setLoading(true);
    setPeriodName(timeframe === "last_24" ? "Last 24 hours" : "All time");
    if (timezoneOffset !== "") {
      fetchBarChartData();
    }
  }, [timezoneOffset, timeframe]);

  const fetchBarChartData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BARS_URL + timeframe);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();

      const adjustedLabels = data.map((item) => {
        let adjustedHour = item.hour - timezoneOffset;
        if (adjustedHour < 0) {
          adjustedHour += 24;
        } else if (adjustedHour >= 24) {
          adjustedHour -= 24;
        }
        return adjustedHour;
      });
      const counts = data.map((item) => item.count);

      // Sort data if timeframe is all_time
      if (timeframe === "all_time") {
        const sortedData = adjustedLabels
          .map((label, index) => ({
            label,
            count: counts[index],
          }))
          .sort((a, b) => a.label - b.label);

        setBarChartData({
          labels: sortedData.map((item) => item.label),
          datasets: [
            {
              label: "Track Count",
              backgroundColor: "rgba(237, 110, 133, 0.2)",
              borderColor: "rgba(237, 110, 133, 1)",
              borderWidth: 1,
              hoverBackgroundColor: "rgba(237, 110, 133, 0.4)",
              hoverBorderColor: "rgba(237, 110, 133, 1)",
              data: sortedData.map((item) => item.count),
            },
          ],
        });
      } else {
        setBarChartData({
          labels: adjustedLabels,
          datasets: [
            {
              label: "Track Count",
              backgroundColor: "rgba(237, 110, 133, 0.2)",
              borderColor: "rgba(237, 110, 133, 1)",
              borderWidth: 1,
              hoverBackgroundColor: "rgba(237, 110, 133, 0.4)",
              hoverBorderColor: "rgba(237, 110, 133, 1)",
              data: counts,
            },
          ],
        });
      }

      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const options = {
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Hour Played At",
        },
        maxTicksLimit: 24,
      },
      y: {
        title: {
          display: false,
          text: "Track Count",
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
  };

  const headingStyles = {
    as: "h2",
    size: ["xs", "sm"],
    paddingTop: "1vh",
    paddingBottom: "2vh",
  };

  return (
    <Stack className="bar-chart-container">
      <Heading {...headingStyles}>LISTENING TIME ({periodName})</Heading>
      {loading && (
        <Flex marginTop="15vh" marginLeft={["40vw", "22vw"]}>
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
  );
};

export default BarChartContainer;
