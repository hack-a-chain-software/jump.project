import { useCallback, useEffect, useMemo, useState } from "react";
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
import { viewFunction } from "../../tools/modules/near";
interface TokenRatio {
  x_token: string;
  base_token: string;
}

function Staking() {
  const { accountId, selector, token } = useWalletSelector();
  const [xJumpRatioRaw, setXJumpRatioRaw] = useState("0");
  const [baseTokenRatioRaw, setBaseTokenRatioRaw] = useState("0");
  const { stakeXToken: stakeXJumpToken, burnXToken: unstakeXJumpToken } =
    useStaking();

  useEffect(() => {
    const fetchXJumpRatio = async () => {
      const data = await viewFunction(
        selector,
        X_JUMP_TOKEN,
        "view_token_ratio"
      );
      setXJumpRatioRaw(data?.x_token);
      setBaseTokenRatioRaw(data?.base_token);
    };

    fetchXJumpRatio();
  }, []);

  // Blockchain Data
  // const {
  //   data: { x_token: rawRatioTetherToken = XJUMP_BASE_USDT_TOKEN_RATIO } = {},
  //   loading: loadingTetherRatio,
  // } = useTokenRatio(XJUMP_TETHER_TOKEN);

  const {
    data: rawBalanceXJumpToken = "0",
    loading: loadingBalanceXJumpToken,
  } = useTokenBalance(X_JUMP_TOKEN, accountId);

  // Calculating balances
  const rawRawBalanceXJumpToken = useMemo(
    () => rawBalanceXJumpToken || "0",
    [rawBalanceXJumpToken]
  );

  const jumpTokenBalance = useMemo(
    () => token?.balance || "0",
    [token?.balance]
  );

  const jumpToken = useMemo(() => {
    return baseTokenRatioRaw === "0" ? "1" : baseTokenRatioRaw;
  }, [baseTokenRatioRaw]);

  const xJumpToken = useMemo(() => {
    return xJumpRatioRaw === "0" ? "1" : xJumpRatioRaw;
  }, [xJumpRatioRaw]);

  // const tetherToken = useMemo(() => {
  //   return rawRatioTetherToken === "0" ? "1" : rawRatioTetherToken;
  // }, [rawRatioTetherToken]);

  const submitStaking = useCallback(
    async (amount: string) => {
      const deposit = calcAmountRaw(amount, token?.metadata?.decimals);

      try {
        await stakeXJumpToken(deposit, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, token?.metadata]
  );

  const submitWithdraw = useCallback(
    async (amount: string) => {
      const withdraw = calcAmountRaw(amount, token?.metadata?.decimals);

      try {
        await unstakeXJumpToken(withdraw, accountId!, selector);
      } catch (error) {
        console.warn(error);
      }
    },
    [accountId, token?.metadata]
  );

  const isLoading = useMemo(() => {
    return loadingBalanceXJumpToken;
  }, [loadingBalanceXJumpToken]);

  // Calculating meaningful ratios
  const decimals = useMemo(() => {
    return getDecimals(token?.metadata?.decimals);
  }, [token?.metadata]);

  const ratioJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(jumpToken, decimals);
  }, [jumpToken, decimals]);

  const ratioXJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(xJumpToken, decimals);
  }, [xJumpToken, decimals]);

  // const ratioTetherToken = useMemo(() => {
  //   return parseToBigAndDivByDecimals(tetherToken, decimals);
  // }, [tetherToken, decimals]);

  const valueJumpToken = useMemo(() => {
    return divideAndParseToTwoDecimals(ratioJumpToken, ratioXJumpToken);
  }, [ratioJumpToken, ratioXJumpToken]);

  const valueXJumpToken = useMemo(() => {
    return divideAndParseToTwoDecimals(ratioXJumpToken, ratioJumpToken);
  }, [ratioJumpToken, ratioXJumpToken]);

  const balanceXJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(
      rawRawBalanceXJumpToken,
      decimals
    ).toFixed(2);
  }, [rawRawBalanceXJumpToken, decimals]);

  const balanceJumpToken = useMemo(() => {
    return parseToBigAndDivByDecimals(jumpTokenBalance, decimals).toFixed(2);
  }, [jumpTokenBalance, valueJumpToken]);

  const apr = useMemo(() => {
    const base = new Big(JUMP_YEARLY_DISTRIBUTION_COMPROMISE).mul(100);
    console.log(base);
    const baseBig = new Big(jumpToken);
    console.log(baseBig);

    // const denom = new Big(10).pow(9);

    return base.div(baseBig);
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

  // const valuePerDayTetherToken = useMemo(() => {
  //   if (new Big(valuePerDayJumpToken).eq("0")) return new Big("0").toFixed(2);
  //   return divideAndParseToTwoDecimals(ratioTetherToken, valuePerDayJumpToken);
  // }, [valuePerDayJumpToken]);

  function parseToBigAndDivByDecimals(value: string | number, decimals: Big) {
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
    // valuePerDayTetherToken,

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
