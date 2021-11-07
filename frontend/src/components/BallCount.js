import { Box } from "@chakra-ui/layout";

export default function BallCount(props) {
  return (
    <Box
      border
      borderWidth={1}
      p={3}
      borderRadius={"xl"}
      boxShadow={"lg"}
      borderColor={"gray.500"}
    >
      Balls Left {props.count}
    </Box>
  );
}
