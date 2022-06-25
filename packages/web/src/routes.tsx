import { WalletIcon } from "./assets/svg";
import { AnalyticsIcon } from "./assets/svg/analytics";
import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
import { SwapIcon } from "./assets/svg/swap";

export const routes = {
  home: "/launchpad",
  projectDetails: "/launchpad/:id",
  staking: "/staking",
};

export const navRoutes = [
  {
    title: "Launchpad",
    icon: <RocketIcon />,
    route: "/launchpad",
    subroutePrefix: "/launchpad",
  },
  {
    title: "Staking",
    icon: <WalletIcon />,
    route: "/staking",
    subroutePrefix: "staking",
  },
  {
    title: "NFT Staking",
    icon: <WalletIcon />,
    route: "/nft-staking",
    subroutePrefix: "nft-staking",
  },
  {
    title: "Swap",
    icon: <SwapIcon />,
    route: "/swap",
    subroutePrefix: "swap",
  },
  {
    title: "Pools",
    icon: <PoolsIcon />,
    route: "/pools",
    subroutePrefix: "pools",
  },
  {
    title: "Farm",
    icon: <FarmIcon />,
    route: "/farm",
    subroutePrefix: "farm",
  },
  {
    title: "Analytics",
    icon: <AnalyticsIcon />,
    route: "/analytics",
    subroutePrefix: "analytics",
  },
];
