import { Flex } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { Header, Nav, ReportButton } from "./components";
import { useTheme } from "./hooks/theme";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { useWalletSelector } from "@/context/wallet-selector";
import {
  getTransactionState,
  getTransactionsAction,
  viewFunction,
} from "./tools";
import routes from "virtual:generated-pages-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Pages = () => {
  return useRoutes(routes);
};

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

function App() {
  const { gradientBackground } = useTheme();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!accountId || !transactionHashes) {
      return;
    }

    (async () => {
      const transactions = transactionHashes.split(",");

      const states: any[] = [];

      for (let i = 0; i < transactions.length; i++) {
        const state = await getTransactionState(transactions[i], accountId);

        states.push(state);
      }

      const action = getTransactionsAction(states);

      if (!action) {
        return;
      }

      toast[action.status](action.message);
    })();
  }, [accountId]);

  return (
    <Flex flex={1} bg={gradientBackground}>
      <ReportButton />

      <Router>
        <Header />

        <Flex w="100vw" ml="auto" minH="100vh" position="relative">
          <Nav />
          <div className="md:w-[calc(100vw-140px)] max-w-[1512px] mx-auto">
            <Pages />
          </div>
        </Flex>
      </Router>

      <Toaster position="top-center" />
    </Flex>
  );
}

export default App;
