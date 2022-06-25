import { Flex, Grid } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header, Nav } from "./components";
import { useTheme } from "./hooks/theme";
import { Home } from "./pages/home";
import { NFTStaking } from "./pages/nft-staking";
import { Project } from "./pages/project";
import { Staking } from "./pages/staking";
import { routes } from "./routes";

/**
 * @name Router
 * @description - This is the application router that will have all the app routes!
 * And also some business logic to handle near initialization
 */
function Router() {
  const { gradientBackground } = useTheme();
  return (
    <Flex flex={1} bg={gradientBackground}>
      <BrowserRouter>
        <Header />
        <Grid w="100%" ml="120px" minH="100vh" templateColumns="1fr">
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to={routes.home} />} />
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.projectDetails} element={<Project />} />
            <Route path={routes.staking} element={<Staking />} />
            <Route path={routes.nftStaking} element={<NFTStaking />} />
          </Routes>
        </Grid>
      </BrowserRouter>
    </Flex>
  );
}

export default Router;
