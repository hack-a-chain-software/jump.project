import { LaunchpadFilters } from "@/types";

export enum ListingStatuses {
  Funded = "Funded", // Open or Waiting or Ended
  SaleFinalized = "SaleFinalized", // Ended
  PoolCreated = "PoolCreated", // Ended
  PoolProjectTokenSent = "PoolProjectTokenSent", // Ended
  PoolPriceTokenSent = "PoolPriceTokenSent", // Ended
  LiquidityPoolFinalized = "LiquidityPoolFinalized", // Ended
}

export const ImportantStatusFilters: LaunchpadFilters["status"][] = [
  "waiting",
  "closed",
  "open",
];

export const queriesPerStatus = {
  waiting: `
    status = 'Funded'
    AND open_sale_1_timestamp >= CURRENT_TIMESTAMP`,
  closed: `
    (status = 'Funded' AND final_sale_2_timestamp <= CURRENT_TIMESTAMP)
    OR status IN (
      'SaleFinalized',
      'PoolCreated',
      'PoolProjectTokenSent',
      'PoolPriceTokenSent',
      'LiquidityPoolFinalized'
    )`,
  open: `
    status = 'Funded'
    AND open_sale_1_timestamp <= CURRENT_TIMESTAMP 
    AND final_sale_2_timestamp >= CURRENT_TIMESTAMP`,
} as Record<LaunchpadFilters["status"], string>;
