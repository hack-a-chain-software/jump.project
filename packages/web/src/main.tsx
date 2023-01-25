import { Buffer } from "buffer";
import React, { Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import App from "./app";
import { ProviderNear } from "./hooks/near";
import { WalletSelectorContextProvider } from "@/context/wallet-selector";
import { theme } from "./theme";
import { WalletSelectorModal } from "@/modals";
import { buildClient } from "./resolvers";
import "./index.css";
import "intro.js/introjs.css";
import { inject } from "@vercel/analytics";
// TODO: Find a better way to handle this buffer error
window.Buffer = window.Buffer || Buffer;
inject();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={buildClient(import.meta.env.VITE_GRAPHQL_API_URI)}>
      <WalletSelectorContextProvider>
        <ChakraProvider theme={theme}>
          <ProviderNear
            environment={import.meta.env.VITE_NEAR_NETWORK || "testnet"}
          >
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />

            <Suspense fallback={<p>Loading...</p>}>
              <App />
            </Suspense>
            <WalletSelectorModal />
          </ProviderNear>
        </ChakraProvider>
      </WalletSelectorContextProvider>
    </ApolloProvider>
  </React.StrictMode>
);
