import {
  Flex,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { JumpIcon } from "../../assets/svg/jump-logo";
import { useTheme } from "../../hooks/theme";
import { navRoutes, routes } from "../../routes";

const enabledRoutes = [routes.staking, routes.home];

export const Nav = () => {
  const navigate = useNavigate();

  return (
    <Flex
      h="100vh"
      w="120px"
      zIndex="1"
      bg="transparent"
      position="fixed"
      left="0px"
      top="0px"
      bottom="0px"
      flexDirection="column"
      alignItems="center"
      pt="40px"
      gap="25px"
    >
      <Flex>
        <JumpIcon />
      </Flex>
      <Stack
        display="flex"
        flex={1}
        gap="10px"
        alignItems="center"
        justifyContent="center"
        pb="100px"
      >
        {navRoutes.map((e) => (
          <Flex
            alignItems="center"
            w="80px"
            minH="80px"
            cursor={enabledRoutes.includes(e.route) ? "pointer" : "not-allowed"}
            transition="0.3s"
            onClick={() =>
              enabledRoutes.includes(e.route) ? navigate(e.route) : null
            }
            userSelect="none"
            justifyContent="center"
            key={e.route}
            direction="column"
          >
            <Text
              userSelect="none"
              textAlign="center"
              display="flex"
              alignItems="center"
              flexDirection="column"
              fontSize="12px"
              pt={2}
              opacity={
                window.location.pathname.includes(e.subroutePrefix) ? 1 : 0.3
              }
            >
              {e.icon}
              {e.title}
            </Text>
          </Flex>
        ))}
      </Stack>
    </Flex>
  );
};
