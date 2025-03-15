import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import LoadingIndicator from "./LoadingIndicator";
import { Heading } from "@chakra-ui/react";
import { Chart } from "chart.js";

const GenresBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(process.env.REACT_APP_GENRES_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setChartData(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const options = {
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(0, 0, 0, 0.1)",
          lineWidth: 0.5,
          drawTicks: false,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    // aspectRatio: 3, // Change the aspect ratio to adjust the height
  };

  const headingStyles = {
    as: "h2",
    size: ["xs", "sm"],
    marginLeft: "10px",
    paddingTop: "5px",
    paddingBottom: "20px",
  };

  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#9966CC", "#FFA07A"];

  return (
    <div className="genres-bar-chart-container">
      <Heading {...headingStyles}>TOP 20 GENRES</Heading>
      <div className={`genre-bar-chart ${loading ? "loading" : ""}`}>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <Bar
            data={{
              labels: chartData.map((item) => item.genre),
              datasets: [
                {
                  label: "Count",
                  data: chartData.map((item) => item.count_tracks),
                  backgroundColor: colors,
                  barThickness: 20,
                },
              ],
            }}
            options={options}
          />
        )}
      </div>
      {error && <div>Error fetching bar chart data: {error.message}</div>}
    </div>
  );
};

export default GenresBarChart;
