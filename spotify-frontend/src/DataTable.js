import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Flex,
} from "@chakra-ui/react";
import LoadingIndicator from "./LoadingIndicator"; // Import LoadingIndicator component

const DataTable = ({ timeframe }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTableData();
  }, [timeframe]);

  const fetchTableData = async () => {
    try {
      // Simulate fetching data from an API
      const response = await fetch(process.env.REACT_APP_TABLE_URL + timeframe);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="table-container">
      {/* <Heading {...headingStyles}>TOP 5 TRACKS</Heading> */}
      {loading ? (
        <Flex marginLeft={["50vw", "25vw"]} marginTop="30vh">
          <LoadingIndicator />
        </Flex>
      ) : (
        <Table variant="simple" size={("xs", "sm")}>
          <Thead>
            <Tr>
              <Th>TOP 5 TRACKS</Th>
              <Th>TRACK NAME</Th>
              <Th display={{ base: "none", md: "table-cell" }}>ALBUM</Th>
              <Th display={{ base: "none", md: "table-cell" }}>ARTIST</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                <Td>
                  <Link href={item.track_url} isExternal>
                    <img
                      src={item.album_image_url}
                      alt={item.name}
                      style={{ maxWidth: "100px" }}
                    />
                  </Link>
                </Td>
                <Td>
                  <Link href={item.track_url} isExternal>
                    {item.track_name}
                  </Link>
                </Td>
                <Td display={{ base: "none", md: "table-cell" }}>
                  {item.album_name}
                </Td>
                <Td display={{ base: "none", md: "table-cell" }}>
                  {item.artist_name}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

export default DataTable;
