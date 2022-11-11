import { FarmIcon } from "./assets/svg/farm";
import { PoolsIcon } from "./assets/svg/pools";
import { RocketIcon } from "./assets/svg/rocket";
import { LockIcon } from "./assets/svg/lock";
import { SwapIcon } from "./assets/svg/swap";
import { AnalyticsIcon } from "./assets/svg/analytics";
import { StakingIcon } from "./assets/svg/nft-staking-icon";
import { XJumpIcon } from "./assets/svg/xjump-icon";
import { TokenLabIcon } from "./assets/svg/token-lab-icon";

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
    title: "xJUMP",
    icon: <XJumpIcon />,
    route: "/coin-staking",
    subroutePrefix: "coin-staking",
  },
  {
    enabled: true,
    title: "NFT Staking",
    icon: <StakingIcon />,
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
    title: "Token Laboratory",
    icon: <TokenLabIcon />,
    route: "/token-launcher",
    subroutePrefix: "token-launcher",
  },
  {
    title: "Pools",
    icon: <PoolsIcon />,
    route: "/pools",
    subroutePrefix: "pools",
  },
  {
    title: "Swap",
    icon: <SwapIcon />,
    route: "/swap",
    subroutePrefix: "swap",
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
