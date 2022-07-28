import {
  Flex,
  Image,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Select, TopCard } from "../components";

/**
 * @route - '/'
 * @description - This is the landing page for the near application
 * @name Home
 */
export function Home() {
  const navigate = useNavigate();
  return (
    <Flex gap="30px" direction="column" p="30px" w="100%" pt="150px">
      <TopCard
        gradientText="Launchpad"
        bigText="Stake. Help. Earn."
        bottomDescription="This is the Jump launchad where you can spend the launchpad tickets to invest and support Launchpad Projects"
        jumpLogo
      />

      <Flex justifyContent="space-between">
        <Select placeholder="Select the status">
          <option value="option1">All</option>
          <option value="option2">Open</option>
          <option value="option3">Closed</option>
        </Select>
        <Flex maxW="330px" w="100%">
          <Input
            borderWidth="2px"
            h="60px"
            maxW="330px"
            w="100%"
            borderRadius={15}
            placeholder="Search by Pool Name, Token, Address"
            _placeholder={{
              color: useColorModeValue("black", "white"),
            }}
            outline="none"
            px="20px"
          />
        </Flex>
      </Flex>

      <TableContainer borderWidth="2px" px="20px" py="20px" borderRadius={20}>
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
              onClick={() => navigate(`/launchpad/1`)}
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
