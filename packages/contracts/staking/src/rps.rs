use crate::*;
use near_sdk::json_types::U128;

impl StakingFT {
  // @private - Calculates the blockchain RPS
  pub fn internal_calculate_rps(&self) -> u128 {
    let timestamp = env::block_timestamp() as u128;
    ((timestamp - self.last_updated) / self.period_duration) * self.yield_per_period
  }

  // @private - Calculates the user unclaimed rewards
  pub fn internal_calculate_user_rewards(&self, account_id: AccountId, contract_rps: u128) -> u128 {
    let user = self
      .user_map
      .get(&account_id)
      .expect("Error user not found");

    user.unclaimed_rewards + ((user.balance * (contract_rps - user.user_rps)) / FRACTION_BASE)
  }

  // @private - This updates the contract RPS and can only be called by the contract
  pub fn update_contract_rps(&mut self) {
    let timestamp = env::block_timestamp() as u128;
    self.last_updated_rps = self.internal_calculate_rps();
    self.last_updated = timestamp;
  }

  // @private - This updates the user RPS and can only be called by the contract
  pub fn update_user_rps(&mut self, account_id: AccountId) {
    let user = self
      .user_map
      .get(&account_id.clone())
      .expect("Error user not found");

    self.user_map.insert(
      &account_id,
      &UserData {
        balance: user.balance,
        unclaimed_rewards: self
          .internal_calculate_user_rewards(account_id.clone(), self.last_updated_rps),
        user_rps: self.last_updated_rps,
      },
    );
  }
}

