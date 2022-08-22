import BN from "bn.js";
import { MAX_NUM } from "./constants";

// TODO: homogenize these functions with BigDecimalFloat ones
export const formatNumber = (
  value: number | BN,
  decimals: number | string | BN,
  suffix: string = ""
) => {
  const number =
    value instanceof BN
      ? getValueWithoutDecimals(value, decimals)
      : value / 10 ** Number(decimals);

  return (
    number.toLocaleString([...navigator.languages], {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) +
    " " +
    suffix
  );
};

// TODO: refactor calls to this function to use BigDecimalFloat
export const getValueWithoutDecimals = (
  value: BN,
  decimals: number | string | BN
) => {
  const denom = new BN("10").pow(new BN(decimals));

  const result = value.div(denom);

  return result.gt(MAX_NUM) ? NaN : result.toNumber();
};

export const getRawAmount = (amount: string | number, decimals: string) => {
  const base = new BN("10").pow(new BN(decimals));

  return new BN(amount).mul(base).toString();
};
