import "./index.css";
import { Buffer } from "buffer";
import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@near/apollo";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import Router from "./router";
import { NearEnvironment } from "react-near";
import { ProviderNear } from "./hooks/near";
import { theme } from "./theme";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <ProviderNear environment={NearEnvironment.TestNet}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Router />
        </ProviderNear>
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>
);
