import { Flex, Stack, Text, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { navRoutes, routes } from "../../routes";

const enabledRoutes = [
  routes.staking,
  routes.home,
  routes.nftStaking,
  routes.vesting,
];

export const Nav = () => {
  const navigate = useNavigate();

  return (
    <Flex
      // minH="100vh"
      w="140px"
      left="0px"
      top="120px"
      pt="121px"
      gap="25px"
      bg="transparent"
      position="sticky"
      className="hidden md:flex sticky top-1 h-max"
    >
      <Stack flex={1} gap="10px" display="flex" alignItems="center">
        {navRoutes.map((e) => (
          <Tooltip
            isDisabled={enabledRoutes.includes(e.route)}
            key={e.route}
            hasArrow
            label="Coming soon"
            placement="right"
          >
            <Flex
              alignItems="center"
              w="80px"
              minH="80px"
              cursor={
                enabledRoutes.includes(e.route) ? "pointer" : "not-allowed"
              }
              transition="0.3s"
              onClick={() =>
                enabledRoutes.includes(e.route) ? navigate(e.route) : null
              }
              userSelect="none"
              justifyContent="center"
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
          </Tooltip>
        ))}
      </Stack>
    </Flex>
  );
};
