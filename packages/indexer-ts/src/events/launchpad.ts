import { NearEvent } from "../types";

/* Define all interested events that will trigger DB actions
 * All other events will be discarded
 */
const ADD_GUARDIAN = "add_guardian";
type AddGuardianData = {
  new_guardian: string;
};

const REMOVE_GUARDIAN = "remove_guardian";
type RemoveGuardianData = {
  old_guardian: string;
};

const RETRIVE_TREASURY_FUNDS = "retrieve_treasury_funds";
type RetrieveTreasuryFundsData = {
  token_type: string;
  quantity: string;
};

const CREATE_LISTING = "create_listing";
type TokenType = {
  FT: {
    account_id: string;
  };
};
type Listing = {
  listing_id: string;
  project_owner: string;
  project_token: TokenType;
  price_token: TokenType;
};
type CreateListingData = {
  listing_data: {
    V1: Listing;
  };
};

const CANCEL_LISTING = "cancel_listing";
const PROJECT_FUND_LISTING = "project_fund_listing";
const PROJECT_WITHDRAW_LISTING = "project_withdraw_listing";
const INVESTOR_BUY_ALLOCATIONS = "investor_buy_allocations";
const INVESTOR_WITHDRAW_ALLOCATIONS = "investor_withdraw_allocations";
const INVESTOR_STAKE_MEMBERSHIP = "investor_stake_membership";
const INVESTOR_UNSTAKE_MEMBERSHIP = "investor_unstake_membership";

export async function handleLaunchpadEvent(event: NearEvent): Promise<void> {
  switch (event.event) {
    case ADD_GUARDIAN: {
      break;
    }
  }
}
