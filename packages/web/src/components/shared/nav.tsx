import { Flex, Stack, Text, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { navRoutes } from "../../routes";
import { JumpIcon } from "../../assets/svg/jump-logo";

export const Nav = () => {
  const navigate = useNavigate();

  return (
    <Flex
      // minH="100vh"
      w="140px"
      left="0px"
      top="120px"
      pt="25px"
      gap="25px"
      bg="transparent"
      position="sticky"
      zIndex="19"
      shrink={0}
      className="hidden md:flex sticky top-1 h-max"
    >
      <Stack flex={1} gap="10px" display="flex" alignItems="center">
        <Flex>
          <JumpIcon />
        </Flex>

        {navRoutes.map((e) => (
          <Tooltip
            isDisabled={e.enabled}
            key={e.route}
            hasArrow
            label="Coming soon"
            placement="right"
          >
            <Flex
              alignItems="center"
              w="80px"
              minH="80px"
              cursor={e.enabled ? "pointer" : "not-allowed"}
              transition="0.3s"
              onClick={() => (e.enabled ? navigate(e.route) : null)}
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
                  window.location.pathname === e.route ||
                  (e.route === "/" &&
                    window.location.pathname.includes("/projects"))
                    ? 1
                    : 0.3
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
