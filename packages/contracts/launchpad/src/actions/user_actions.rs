// ### Normal users

// 1. join sale_1 (if they own xJump);
// 2. join sale_2;
// 3. withdraw unlocked project_tokens from a listing they invested in;
// 4. withdraw vested project_tokens from a listing they invested in;
// 5. withdraw price_tokens from a listing they invested in in case the listing is cancelled;

use crate::*;

#[near_bindgen]
impl Contract {}

/// methods to be called through the token_receiver
impl Contract {
  pub fn investor_stake(
    &mut self,
    amount: u128,
    token_contract: &AccountId,
    account_id: &AccountId,
  ) {
    assert_eq!(
      token_contract, self.contract_settings.membership_token,
      "{}, contract: {}",
      ERR_204, self.contract_settings.membership_token
    );
    let mut investor = self.internal_get_investor(account_id).expect(ERR_004);
    investor.staked_token += amount;
    investor.last_check = env::block_timestamp();
    self.investors.insert(account_id, &VInvestor::V1(investor));
  }

  pub fn buy_allocation(&mut self, listing_id: u64, price_tokens_sent: u128) {
      let listing = self.listings.get(listing_id).expect(ERR_003);
      
  }
}
