import { Box } from "@chakra-ui/layout";
import { Table, Thead, Th, Tr, Td, Tbody } from "@chakra-ui/react";

export default function Leaderboard({ table }) {
  // useEffect(() => {
  //   setTable(data);
  // }, [data]);
  return (
    <Box
      border
      borderWidth={1}
      borderColor={"gray.500"}
      boxShadow={"lg"}
      borderRadius={"xl"}
      p={2}
      m={1}
    >
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th isNumeric>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {table.map((row, index) => {
            return (
              <Tr key={`${index}-${row.name}`}>
                <Td>{row.name}</Td>
                <Td isNumeric>{row.score}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
