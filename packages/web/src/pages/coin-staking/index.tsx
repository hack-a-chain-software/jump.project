import { useCallback, useEffect, useMemo } from "react";
import { useWalletSelector } from "@/context/wallet-selector";
import { X_JUMP_TOKEN, JUMP_TOKEN } from "@/env/contract";
import {
  useTokenBalance,
  useTokenMetadata,
  useTokenRatio,
} from "@/hooks/modules/token";
import {
  JUMP_YEARLY_DISTRIBUTION_COMPROMISE,
  XJUMP_BASE_TOKEN_RATIO,
  XJUMP_BASE_USDT_TOKEN_RATIO,
  XJUMP_BASE_XTOKEN_RATIO,
  XJUMP_TETHER_TOKEN,
} from "./Staking.config";
import { useStaking } from "@/stores/staking-store";
import { getDecimals } from "@/tools";
import StakingComponent from "@/pages/coin-staking/Staking.component";
import Big from "big.js";
import toast from "react-hot-toast/headless";

import { useNearQuery } from "react-near";
interface TokenRatio {
  x_token: string;
  base_token: string;
}

function Staking() {
  const { accountId, selector } = useWalletSelector();
  const { stakeXToken: stakeXJumpToken, burnXToken: unstakeXJumpToken } =
    useStaking();

  // Blockchain Data
  const {
    data: {
      base_token: rawBaseXJumpToken = XJUMP_BASE_TOKEN_RATIO,
      x_token: rawRatioXJumpToken = XJUMP_BASE_XTOKEN_RATIO,
    } = {},
    loading: loadingXJumpRatio,
  } = useNearQuery<TokenRatio>("view_token_ratio", {
    contract: X_JUMP_TOKEN,
    poolInterval: 1000 * 60,
    debug: true,
    onError(err) {
      console.warn(err);
    },
  });
  // console.log(useNearQuery<any>("view_token_ratio", {
  //   contract: X_JUMP_TOKEN,
  //   poolInterval: 1000 * 60,
  //   debug: true,
  //   onError(err) {
  //     console.warn(err);
  //   },
  //   skip: !accountId,
  //   onCompleted: (res) => console.log(res),
  // }));
  const {
    data: { x_token: rawRatioTetherToken = XJUMP_BASE_USDT_TOKEN_RATIO } = {},
    loading: loadingTetherRatio,
  } = useTokenRatio(XJUMP_TETHER_TOKEN);

  const {
    data: rawBalanceXJumpToken = "0",
    loading: loadingBalanceXJumpToken,
  } = useTokenBalance(X_JUMP_TOKEN, accountId);

  const { data: jumpMetadata } = useTokenMetadata(JUMP_TOKEN);

  // Calculating balances
  const rawRawBalanceXJumpToken = useMemo(
    () => rawBalanceXJumpToken || "0",
    [rawBalanceXJumpToken]
  );

  const jumpToken = useMemo(() => {
    return rawBaseXJumpToken === "0" ? "1" : rawBaseXJumpToken;
  }, [rawBaseXJumpToken]);

  const xJumpToken = useMemo(() => {
    return rawRatioXJumpToken === "0" ? "1" : rawRatioXJumpToken;
  }, [rawRatioXJumpToken]);

  const tetherToken = useMemo(() => {
    return rawRatioTetherToken === "0" ? "1" : rawRatioTetherToken;
  }, [rawRatioTetherToken]);

  const submitStaking = useCallback(
    async (amount: string) => {
      console.log(jumpMetadata?.decimals);
      const deposit = calcAmountRaw(amount, jumpMetadata?.decimals);

      try {
        await stakeXJumpToken(deposit, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, jumpMetadata]
  );

  const submitWithdraw = useCallback(
    async (amount: string) => {
      const withdraw = calcAmountRaw(amount, jumpMetadata?.decimals);

      try {
        await unstakeXJumpToken(withdraw, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, jumpMetadata]
  );

  const isLoading = useMemo(() => {
    return loadingBalanceXJumpToken && loadingXJumpRatio && loadingTetherRatio;
  }, [loadingBalanceXJumpToken, loadingXJumpRatio, loadingTetherRatio]);

  // Calculating meaningful ratios
  const decimals = useMemo(() => {
    return getDecimals(jumpMetadata?.decimals);
  }, [jumpMetadata]);

  const ratioJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(jumpToken, decimals);
  }, [jumpToken, decimals]);

  const ratioXJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(xJumpToken, decimals);
  }, [xJumpToken, decimals]);

  const ratioTetherToken = useMemo(() => {
    return parseToBigAndDivByDecimals(tetherToken, decimals);
  }, [tetherToken, decimals]);

  const valueJumpToken = useMemo(() => {
    return divideAndParseToTwoDecimals(ratioJumpToken, ratioXJumpToken);
  }, [ratioJumpToken, ratioXJumpToken]);

  const valueXJumpToken = useMemo(() => {
    return divideAndParseToTwoDecimals(ratioXJumpToken, ratioJumpToken);
  }, [ratioJumpToken, ratioXJumpToken]);

  const balanceXJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(rawRawBalanceXJumpToken, decimals);
  }, [rawRawBalanceXJumpToken, decimals]);

  const balanceJumpToken = useMemo(() => {
    return divideAndParseToTwoDecimals(balanceXJumpToken, valueJumpToken);
  }, [balanceXJumpToken, valueJumpToken]);

  const apr = useMemo(() => {
    const base = new Big(JUMP_YEARLY_DISTRIBUTION_COMPROMISE).mul(100);
    const baseBig = new Big(jumpToken);
    const denom = new Big(10).pow(9);

    return base.div(baseBig).div(denom).toFixed(2);
  }, [jumpToken]);

  const valuePerDayJumpToken = useMemo(() => {
    const year = new Date().getFullYear();
    const numberOfDays =
      year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 366 : 365;
    return divideAndParseToTwoDecimals(
      new Big(valueJumpToken),
      new Big(apr).div(numberOfDays)
    );
  }, [valueJumpToken, apr]);

  const valuePerDayTetherToken = useMemo(() => {
    if (new Big(valuePerDayJumpToken).eq("0")) return new Big("0").toFixed(2);
    return divideAndParseToTwoDecimals(ratioTetherToken, valuePerDayJumpToken);
  }, [valuePerDayJumpToken]);

  function parseToBigAndDivByDecimals(value: string, decimals: Big) {
    return new Big(value).div(decimals);
  }

  function divideAndParseToTwoDecimals(num: Big, denom: Big | string) {
    return num.div(denom).toFixed(2);
  }

  function calcAmountRaw(amount: string, decimals: number | undefined) {
    return new Big(amount).mul(new Big("10").pow(decimals!)).toString();
  }

  async function onSubmit(values, call) {
    try {
      await call(values.value);
    } catch (error) {
      console.warn(error);
      toast("Something went wrong!");
    } finally {
      toast("Done!");
    }
  }

  const stakingProps = {
    isLoading,
    apr,
    valuePerDayJumpToken,
    valuePerDayTetherToken,

    onSubmit,
    submitStaking,
    submitWithdraw,

    valueJumpToken,
    valueXJumpToken,

    balanceXJumpToken,
    balanceJumpToken,
  };

  return <StakingComponent {...stakingProps} />;
}

export default Staking;
