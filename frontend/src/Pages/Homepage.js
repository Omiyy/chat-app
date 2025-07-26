import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <Container maxW="container.md" p={6} className="App">
      <Box className="app-card" p={{ base: 4, md: 8 }}>
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>
          <VStack flex="1" align="flex-start" spacing={2}>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700">
              ChatApp
            </Text>
            <Text color="gray.400" fontSize="sm">
              Minimal. Private. Fast.
            </Text>
          </VStack>

          <Box flex="1" w="100%">
            <Tabs isFitted variant="unstyled" colorScheme="brand">
              <TabList mb={4} gap={2} justifyContent="center">
                <Tab
                  _selected={{ bg: "brand.500", color: "white" }}
                  px={6}
                  py={2}
                  borderRadius="8px"
                >
                  Login
                </Tab>
                <Tab
                  _selected={{ bg: "brand.500", color: "white" }}
                  px={6}
                  py={2}
                  borderRadius="8px"
                >
                  Sign Up
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Login />
                </TabPanel>
                <TabPanel>
                  <Signup />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
}

export default Homepage;
