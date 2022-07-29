export const formatNumber = (value: number, decimals: number) => {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 10 ** decimals);
};
