import Big from "big.js";

// amount of tokens that jump will deposit every month
// this is an alternative while there is no track record
// of yield to extrapolate from
export const jumpYearlyDistributionCompromise = "10000000000000000000";

export function parseToBigAndDivByDecimals(value: string, decimals: Big) {
  return new Big(value).div(decimals);
}

export function divideAndParseToTwoDecimals(num: Big, denom: Big | string) {
  return num.div(denom).toFixed(2);
}

export function calcAmountRaw(amount: string, decimals: number | undefined) {
  const denom = new Big("10").pow(decimals!);

  return new Big(amount).mul(denom).toString();
}

export function calcAPR(distribution: string, basetoken: string) {
  const base = new Big(distribution).mul(100);

  const baseBig = new Big(basetoken);

  const denom = new Big(10).pow(9);

  return base.div(baseBig).div(denom).toFixed(2);
}

export default jumpYearlyDistributionCompromise;
