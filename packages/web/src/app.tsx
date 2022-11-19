import { Toaster } from "react-hot-toast";
import { Header, Nav, ReportButton } from "./components";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { useWalletSelector } from "@/context/wallet-selector";
import { getTransactionState, getTransactionsAction } from "./tools";
import routes from "virtual:generated-pages-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Toast } from "./components";
import ScrollToTop from "@/tools/ScrollToTop";

const Pages = () => {
  const filteredRoutes = routes.map((item) => {
    if (item.children) {
      return {
        ...item,
        children: item.children?.filter((children) => {
          if (
            !children.path?.includes("tutorial") &&
            !children.path?.includes("config")
          ) {
            return children;
          }
        }),
      };
    }

    return item;
  });

  return useRoutes(filteredRoutes);
};

const transactionHashes = new URLSearchParams(window.location.search).get(
  "transactionHashes"
);

function App() {
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

      toast.custom(({ visible }) => <Toast visible={visible} {...action} />);
    })();
  }, [accountId]);

  return (
    <Router>
      <ReportButton />
      <ScrollToTop />
      <Header />
      <div className="w-full flex">
        <Nav />
        <Pages />
      </div>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
