import {
  Box,
  Flex,
  Image,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { CardEndWithJumpLogo } from "../assets/svg/cardEnd";
import { Select } from "../components";

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const navigate = useNavigate();
  return (
    <Flex gap="30px" direction="column" p="30px" w="100%" pt="150px">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        borderRadius="25px"
        bg="darkerGrey"
      >
        <Flex direction="column" pl="60px">
          <Text color="white" fontFamily="Damion" fontSize="50px" as="h1">
            Launchpad
          </Text>
          <Text color="white" fontSize="16px" w="500px">
            A launchpad for new projects to raise capital and for the community
            to participate in new NEAR project launches.
          </Text>
        </Flex>
        <CardEndWithJumpLogo />
      </Box>

      <Flex justifyContent="space-between">
        <Select placeholder="Select the status">
          <option value="option1">All</option>
          <option value="option2">Open</option>
          <option value="option3">Closed</option>
        </Select>
        <Flex maxW="330px" w="100%">
          <Input
            bg={useColorModeValue("#dddddd", "grey.600")}
            h="60px"
            maxW="330px"
            w="100%"
            borderRadius={15}
            placeholder="Search by Pool Name, Token, Address"
            _placeholder={{
              color: useColorModeValue("black", "white"),
            }}
            borderColor="transparent"
            outline="none"
            px="20px"
          />
        </Flex>
      </Flex>

      <TableContainer borderWidth="1px" px="20px" py="20px" borderRadius={20}>
        <Table size="lg" variant="unstyled">
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Price</Th>
              <Th>Access</Th>
              <Th>Max Allocation</Th>
              <Th>Raise Size</Th>
              <Th>Filled</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr
              cursor="pointer"
              onClick={() => navigate(`/project/1`)}
              h="50px"
              alignItems="center"
            >
              <Td>
                <Image
                  borderRadius={100}
                  w={30}
                  h={30}
                  src="https://img.raydium.io/icon/poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk.png"
                />
              </Td>
              <Td>ATLAS</Td>
              <Td>0.012 USDC</Td>
              <Td>JUMP Pool</Td>
              <Td>Lottery</Td>
              <Td>30,000,000 ATLAS</Td>
              <Td>6159.22%</Td>
              <Td>Closed</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}
