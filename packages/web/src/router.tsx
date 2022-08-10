import { Flex, Grid } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header, Nav } from "./components";
import { useTheme } from "./hooks/theme";
import { Home } from "./pages/home";
import { NFTStaking } from "./pages/nft-staking";
import { Vesting } from "./pages/vesting";
import { NFTStakingProject } from "./pages/nft-staking-project";
import { Project } from "./pages/project";
import { Staking } from "./pages/staking";
import { routes } from "./routes";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

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

        <Flex
          w="100vw"
          className="md:w-[calc(100vw-120px)]"
          ml="auto"
          minH="100vh"
        >
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to={routes.home} />} />
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.projectDetails} element={<Project />} />
            <Route path={routes.staking} element={<Staking />} />
            <Route path={routes.nftStaking} element={<NFTStaking />} />
            <Route path={routes.vesting} element={<Vesting />} />
            <Route
              path={routes.nftStakingProject}
              element={<NFTStakingProject />}
            />
          </Routes>
        </Flex>
      </BrowserRouter>

      <Toaster position="top-center" />
    </Flex>
  );
}

export default Router;
