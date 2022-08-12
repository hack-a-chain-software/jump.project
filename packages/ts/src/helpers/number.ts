import BN from "bn.js";

export const formatNumber = (value: number | BN, decimals: number | string) => {
  const number =
    value instanceof BN
      ? getValueWithoutDecimals(value, decimals)
      : value / 10 ** Number(decimals);

  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

export const getValueWithoutDecimals = (
  value: BN,
  decimals: number | string
) => {
  const denom = new BN("10").pow(new BN(decimals));

  return value.div(denom).toNumber();
};
