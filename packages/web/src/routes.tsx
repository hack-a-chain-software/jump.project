import { WalletIcon } from "./assets/svg";
import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
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
    enabled: true,
    title: "Jump Token Laboratory",
    icon: <FarmIcon />,
    route: "/token-launcher",
    subroutePrefix: "token-launcher",
  },
  {
    title: "Pools",
    icon: <PoolsIcon />,
    route: "/pools",
    subroutePrefix: "pools",
  },
];
