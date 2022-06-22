import { WalletIcon } from "./assets/svg";
import { AnalyticsIcon } from "./assets/svg/analytics";
import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
import { SwapIcon } from "./assets/svg/swap";

export const routes = {
  home: "/",
  projectDetails: "/project/:id",
  staking: "/staking",
};

export const navRoutes = [
  {
    title: "Launchpad",
    icon: <RocketIcon />,
    route: "/",
    subroutePrefix: "project",
  },
  {
    title: "Staking",
    icon: <WalletIcon />,
    route: "/staking",
  },
  {
    title: "Swap",
    icon: <SwapIcon />,
    route: "/swap",
  },
  {
    title: "Pools",
    icon: <PoolsIcon />,
    route: "/swap",
  },
  {
    title: "Farm",
    icon: <FarmIcon />,
    route: "/swap",
  },
  {
    title: "Analytics",
    icon: <AnalyticsIcon />,
    route: "/swap",
  },
];
