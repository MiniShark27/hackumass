import { Button } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";

export default function Theme() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
      <Button onClick={toggleColorMode} m={1}>
        Toggle {colorMode === "light" ? "Dark" : "Light"}
      </Button>
  );
}
