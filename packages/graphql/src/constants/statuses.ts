import { LaunchpadFilters } from "@/types";

export enum ListingStatuses {
  Funded = "Funded", // Open or Waiting
  SaleFinalized = "SaleFinalized", // Ended
  PoolCreated = "PoolCreated", // Ended
  PoolProjectTokenSent = "PoolProjectTokenSent", // Ended
  PoolPriceTokenSent = "PoolPriceTokenSent", // Ended
  LiquidityPoolFinalized = "LiquidityPoolFinalized", // Ended
}

export const ImportantStatusFilters = ["Waiting", "Ended", "Open"];

export const queriesPerStatus = {
  Waiting: `
    status = 'Funded'
    AND open_sale_1_timestamp >= CURRENT_TIMESTAMP`,
  Ended: `
    (status = 'Funded' AND final_sale_2_timestamp <= CURRENT_TIMESTAMP)
    OR status IN (
      'SaleFinalized',
      'PoolCreated',
      'PoolProjectTokenSent',
      'PoolPriceTokenSent',
      'LiquidityPoolFinalized'
    )`,
  Open: `
    status = 'Funded'
    AND open_sale_1_timestamp <= CURRENT_TIMESTAMP 
    AND final_sale_2_timestamp >= CURRENT_TIMESTAMP`,
} as Record<LaunchpadFilters["status"], string>;
