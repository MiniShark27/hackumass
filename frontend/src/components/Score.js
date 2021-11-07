import { Box, Heading, Text } from "@chakra-ui/layout";
import { useEffect } from "react";
import { useSpeechSynthesis } from "react-speech-kit";

export default function Score(props) {
  const speech = useSpeechSynthesis();
  const say = (text) => {
    speech.speak({
      text: text,
      voice: speech.voices[33],
    });
  };

  useEffect(() => {
    say(`You have ${props.score} points!`);
  }, [props.score]);

  return (
    <Box
      border
      borderWidth={1}
      borderColor={"gray.500"}
      boxShadow={"lg"}
      borderRadius={"2xl"}
      p={5}
      m={1}
    >
      <Heading size={"4xl"} fontSize={"200"}>
        {props.score}
      </Heading>
      <Text>{props.name}</Text>
    </Box>
  );
}
