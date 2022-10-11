import { WalletIcon } from "./assets/svg";
import { AnalyticsIcon } from "./assets/svg/analytics";
import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
import { SwapIcon } from "./assets/svg/swap";
import { LockIcon } from "./assets/svg/lock";

export const navRoutes = [
  {
    enabled: true,
    title: "Jump Pad",
    icon: <RocketIcon />,
    route: "/",
    subroutePrefix: "/",
  },
  {
    enabled: true,
    title: "xJump",
    icon: <WalletIcon />,
    route: "/coin-staking",
    subroutePrefix: "coin-staking",
  },
  {
    enabled: true,
    title: "Jump NFT Staking",
    icon: <WalletIcon />,
    route: "/nft-staking",
    subroutePrefix: "nft-staking",
  },
  {
    enabled: true,
    title: "Jump Vesting",
    icon: <LockIcon />,
    route: "/vesting",
    subroutePrefix: "vesting",
  },
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
];
