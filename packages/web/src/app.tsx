import { Flex } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { Header, Nav, ReportButton } from "./components";
import { useTheme } from "./hooks/theme";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

import routes from "virtual:generated-pages-react";

const Pages = () => {
  return useRoutes(routes);
};

/**
 * @name Router
 * @description - This is the application router that will have all the app routes!
 * And also some business logic to handle near initialization
 */
function App() {
  const { gradientBackground } = useTheme();

  return (
    <Flex flex={1} bg={gradientBackground}>
      <ReportButton />

      <Router>
        <Header />

        <Flex w="100vw" ml="auto" minH="100vh" position="relative">
          <Nav />
          <div className="w-full max-w-[1512px] mx-auto">
            <Pages />
          </div>
        </Flex>
      </Router>

      <Toaster position="top-center" />
    </Flex>
  );
}

export default App;
