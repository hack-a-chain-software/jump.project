import BN from "bn.js";

const MAX_NUM = new BN(2 ** 53 - 1);

const LOCALE = [...navigator.languages];

export const formatNumber = (
  value: number | BN,
  decimals: number | string | BN
) => {
  const number =
    value instanceof BN
      ? getValueWithoutDecimals(value, decimals)
      : value / 10 ** Number(decimals);

  return number.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const getValueWithDecimals = (
  value: BN,
  decimals: number,
  showDecimals: number
) => {
  const base = new BN(10).pow(new BN(decimals));
  const div = new BN(value).div(base);
  const mod = new BN(value).mod(base);
  return (
    div +
    (showDecimals
      ? "." + mod.toString(10, decimals).substring(0, showDecimals)
      : "")
  );
};

type UnitAwareBN = { value: BN; decimals: BN };

type FormatFractionOptions = {
  maximumFractionDigits?: number;
  unit?: string;
};

/*
  price <- price / 10**decimals_price
  size <- size / 10**decimals_size
 
  (price / size) * 10^(decimals_project - decimals_price) 
*/
// TODO: test with fractional numbers (value < 10^decimals)
// TODO: test with numbers that are close in value but not in decimals
export function formatFraction(
  numerator: UnitAwareBN,
  denominator: UnitAwareBN,
  { maximumFractionDigits = 2, unit = "" }: FormatFractionOptions
) {
  console.log({
    maximumFractionDigits,
    numeratorV: numerator.value.toString(),
    numeratorD: numerator.decimals.toString(),
    denominatorV: denominator.value.toString(),
    denominatorD: denominator.decimals.toString(),
  });

  const delta = BN.min(numerator.decimals.sub(denominator.decimals), new BN(0));

  const exponent = new BN(maximumFractionDigits).add(delta.neg());

  const normalizationFactor = new BN(10).pow(exponent);

  const quotient = numerator.value
    .mul(normalizationFactor)
    .div(denominator.value);

  if (quotient.gt(MAX_NUM)) {
    return NaN;
  }

  return (
    getValueWithDecimals(
      quotient,
      maximumFractionDigits +
        (delta.lt(new BN(0)) ? 0 : delta.neg().toNumber()),
      maximumFractionDigits
    ) + (unit ? ` ${unit}` : "")
  );

  /*return (quotient.toNumber() / 10 ** maximumFractionDigits).toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })  */
}

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
