import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import LoadingIndicator from "./LoadingIndicator";
import { Heading } from "@chakra-ui/react";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);

const DoughnutChart = ({ title, url }) => {
  const [pieChartData, setPieChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#9966CC", "#FFA07A"];

  useEffect(() => {
    const fetchPieChartDataFromAPI = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
      }
    };

    setError(null);
    setLoading(true);

    fetchPieChartDataFromAPI(url)
      .then((data) => {
        setPieChartData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const headingStyles = {
    as: "h2",
    size: ["xs", "sm"],
    paddingTop: "10px",
    paddingBottom: "2.5vh",
  };

  return (
    <div className={`doughnut-chart ${loading ? "loading" : ""}`}>
      <Heading {...headingStyles} marginBottom={loading ? "7.5vh" : "2.5vh"}>
        {title}
      </Heading>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <Doughnut
          data={{
            labels: pieChartData.map((item) => item.category),
            datasets: [
              {
                data: pieChartData.map((item) => item.value),
                backgroundColor: colors,
                hoverBackgroundColor: colors,
              },
            ],
          }}
          options={options}
        />
      )}
      {error && <div>Error fetching pie chart: {error.message}</div>}
    </div>
  );
};

export default DoughnutChart;
