import {
  ChakraProvider,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Center } from "@chakra-ui/layout";
import { io } from "socket.io-client";
import Score from "./components/Score";
import Theme from "./components/Theme";
import Leaderboard from "./components/Leaderboard";
import { useEffect, useState } from "react";
import BallCount from "./components/BallCount";

export default function App() {
  const [table, setTable] = useState([]);
  const [score, setScore] = useState(0);
  const [ballCount, setBallCount] = useState(0);
  const [name, setName] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newsocket = io("http://localhost:9000");
    setSocket(newsocket);
    newsocket.on("gamedata", (data) => {
      setTable(data.leaderBoard);
      setScore(data.score);
      setBallCount(data.ballCount);
      setName(data.name);
    });
  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/data")
      .then((response) => response.json())
      .then((data) => {
        setScore(data.score);
        setTable(data.leaderBoard);
        setBallCount(data.ballCount);
        console.log(data);
      });
  }, []);

  return (
    <ChakraProvider>
      <Theme />
      <Center h={"40vh"}>
        <Score score={score} name={name} />
        <BallCount count={ballCount} />
      </Center>
      <Center>
        <Leaderboard data={table} table={table} />
      </Center>
      <GameOver balls={ballCount} score={score} socket={socket} />
    </ChakraProvider>
  );
}

function GameOver({ balls, score, socket }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const handleName = (e) => {
    setName(e.target.value);
  };

  const handleNewGame = () => {
    console.log("new game");
    socket.emit("newgame", { name: name });
    onClose();
  };

  useEffect(() => {
    if (balls === 0) {
      onOpen();
    }
  }, [balls]);
  return (
    <>
      <Button m={1} onClick={onOpen}>New Game</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Game Over</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You scored: {score}
            <br />
            Start a new game
            <FormControl id="first-name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                onKeyDown={(e) => {
                  if (e.keyCode === 13) handleNewGame();
                }}
                placeholder="Your name"
                value={name}
                onChange={handleName}
              />
              <Button m={1} onClick={handleNewGame} isDisabled={name === ""}>
                Submit
              </Button>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
