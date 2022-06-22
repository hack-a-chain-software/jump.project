import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { JumpIcon } from "../../assets/svg/jump-logo";
import { navRoutes, routes } from "../../routes";

const enabledRoutes = [routes.staking, routes.home];

export const Nav = () => {
  const navigate = useNavigate();

  return (
    <Flex
      borderRightColor={useColorModeValue("grey.100", "grey.600")}
      borderRightWidth={1}
      h="100vh"
      w="120px"
      zIndex="1"
      bg={useColorModeValue("white", "black")}
      position="fixed"
      left="0px"
      top="0px"
      bottom="0px"
      flexDirection="column"
      alignItems="center"
      pt="40px"
      gap="25px"
    >
      <Flex marginBottom="40px">
        <JumpIcon />
      </Flex>
      {navRoutes.map((e) => (
        <Flex
          alignItems="center"
          bg="black"
          w="80px"
          minH="80px"
          borderRadius={20}
          backgroundColor={
            window.location.pathname === e.route
              ? "brand.900"
              : e.subroutePrefix &&
                window.location.pathname.includes(e.subroutePrefix)
              ? "brand.900"
              : "transparent"
          }
          cursor={enabledRoutes.includes(e.route) ? "pointer" : "not-allowed"}
          transition="0.3s"
          _hover={{
            background: useColorModeValue(
              "rgba(0,0,0,0.3)",
              "rgba(255, 255, 255, 0.2)"
            ),
          }}
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
            color={
              window.location.pathname === e.route
                ? "white"
                : e.subroutePrefix &&
                  window.location.pathname.includes(e.subroutePrefix)
                ? "white"
                : "gray.500"
            }
          >
            {e.icon}
            {e.title}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};
