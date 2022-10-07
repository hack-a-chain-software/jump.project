import { WalletIcon } from "./assets/svg";
import { AnalyticsIcon } from "./assets/svg/analytics";
import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
import { SwapIcon } from "./assets/svg/swap";
import { LockIcon } from "./assets/svg/lock";

export const routes = {
  home: "/launchpad",
  projectDetails: "/launchpad/:id",
  staking: "/coin-staking",
  nftStaking: "/nft-staking",
  vesting: "/vesting",
  nftStakingProject: "/nft-staking/:id",
  tokenLauncher: "/token-launcher",
};

export const navRoutes = [
  {
    title: "Jump Pad",
    icon: <RocketIcon />,
    route: "/launchpad",
    subroutePrefix: "/launchpad",
  },
  {
    title: "xJump",
    icon: <WalletIcon />,
    route: "/coin-staking",
    subroutePrefix: "coin-staking",
  },
  {
    title: "Jump NFT Staking",
    icon: <WalletIcon />,
    route: "/nft-staking",
    subroutePrefix: "nft-staking",
  },
  {
    title: "Jump Vesting",
    icon: <LockIcon />,
    route: "/vesting",
    subroutePrefix: "vesting",
  },
  {
    title: "Create Token",
    icon: <WalletIcon />,
    route: "/token-launcher",
    subroutePrefix: "token-launcher",
  },
  // {
  //   title: "Swap",
  //   icon: <SwapIcon />,
  //   route: "/swap",
  //   subroutePrefix: "swap",
  // },
  {
    title: "Pools",
    icon: <PoolsIcon />,
    route: "/pools",
    subroutePrefix: "pools",
  },
  {
    title: "Jump Token Laboratory",
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
