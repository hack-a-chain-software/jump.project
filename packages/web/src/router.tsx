import { Grid, useColorModeValue } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header, Nav } from "./components";
import { Home } from "./pages/home";
import { Project } from "./pages/project";
import { Staking } from "./pages/staking";
import { routes } from "./routes";

/**
 * @name Router
 * @description - This is the application router that will have all the app routes!
 * And also some business logic to handle near initialization
 */
function Router() {
  return (
    <div className={`${useColorModeValue("bg-white", "bg-black")}`}>
      <BrowserRouter>
        <Header />
        <Grid
          ml="120px"
          minH="100vh"
          templateColumns="1fr"
          bg={useColorModeValue("white", "black")}
        >
          <Nav />
          <Routes>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.projectDetails} element={<Project />} />
            <Route path={routes.staking} element={<Staking />} />
          </Routes>
        </Grid>
      </BrowserRouter>
    </div>
  );
}

export default Router;
