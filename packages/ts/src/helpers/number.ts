import BN from "bn.js";

const MAX_NUM = new BN(2 ** 53 - 1);

export const formatNumber = (value: number | BN, decimals: number | string) => {
  const number =
    value instanceof BN
      ? getValueWithoutDecimals(value, decimals)
      : value / 10 ** Number(decimals);

  return number.toLocaleString([...navigator.languages], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const getValueWithoutDecimals = (
  value: BN,
  decimals: number | string
) => {
  const denom = new BN("10").pow(new BN(decimals));

  const result = value.div(denom);

  return result.gt(MAX_NUM) ? NaN : result.toNumber();
};
