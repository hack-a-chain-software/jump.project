import "./index.css";
import { Buffer } from "buffer";
import React from "react";
import { ApolloProvider } from "@apollo/client";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import Router from "./router";
import { NearEnvironment } from "react-near";
import { ProviderNear } from "./hooks/near";
import { WalletSelectorContextProvider } from "@/context/wallet-selector";
import { theme } from "./theme";
import { WalletSelectorModal } from "@/modals";
import { buildClient } from "./resolvers";

// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={buildClient(import.meta.env.VITE_GRAPHQL_API_URI)}>
      <ChakraProvider theme={theme}>
        <ProviderNear
          environment={import.meta.env.VITE_NEAR_NETWORK || "testnet"}
        >
          <WalletSelectorContextProvider>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <Router />

            <WalletSelectorModal />
          </WalletSelectorContextProvider>
        </ProviderNear>
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>
);
