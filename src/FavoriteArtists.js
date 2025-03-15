import React, { useState, useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Link, Flex } from "@chakra-ui/react";
import LoadingIndicator from "./LoadingIndicator"; // Import LoadingIndicator component

const FavoriteArtists = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_FAVORITE_ARTISTS_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json(); // Parse the JSON response
      console.log(data); // Log the parsed JSON data
      setData(data); // Set the state with the parsed JSON data
      setLoading(false); // Update loading state
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error); // Set error state if there's an error
      setLoading(false); // Update loading state
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="artists-table-container">
      {/* <Heading {...headingStyles}>TOP 5 TRACKS</Heading> */}
      {loading ? (
        <Flex marginLeft={["50vw", "25vw"]} marginTop="30vh">
          <LoadingIndicator />
        </Flex>
      ) : (
        <Table variant="simple" size={["sm"]}>
          <Thead>
            <Tr>
              <Th>TOP 5 ARTISTS</Th>
              <Th>NAME</Th>
              <Th>BB INDEX</Th>
              <Th display={{ base: "none", md: "table-cell" }}>GENRE</Th>
              <Th>TRACKS PLAYED</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                <Td>
                  <Link href={item.external_urls_spotify} isExternal>
                    <img
                      src={item.images_url}
                      alt={item.name}
                      style={{ maxWidth: "100px" }}
                    />
                  </Link>
                </Td>
                <Td>
                  <Link href={item.external_urls_spotify} isExternal>
                    {item.name}
                  </Link>
                </Td>
                <Td>{item.popularity}</Td>
                <Td display={{ base: "none", md: "table-cell" }}>
                  {item.main_genre}
                </Td>
                <Td>{item.count_tracks}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

export default FavoriteArtists;
