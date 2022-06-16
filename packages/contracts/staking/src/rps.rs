use crate::*;

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
      .expect("User has not been found");

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
      .expect("User has not been found");

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

// #[cfg(test)]
// mod tests {
//   use crate::*;
//   use crate::tests::{get_context, sample_contract, TOKEN_ACCOUNT};
//   use near_sdk::testing_env;
//   use near_sdk::MockedBlockchain;

//   #[test]
//   // should update the blockchain rps based on the timestamp
//   fn test_update_rps() {
//     let context = get_context(vec![], false, 1, 100, TOKEN_ACCOUNT.to_string());
//     testing_env!(context);
//     let mut contract = sample_contract();
//     assert!(contract.last_updated_rps == 0);
//     let contract_last_rps = contract.last_updated_rps;
//     contract.update_contract_rps();
//     assert!(contract_last_rps != contract.last_updated_rps);
//   }

//   #[test]
//   // should update the blockchain rps based on the timestamp
//   fn test_update_user_rps() {
//     let test_account = "test.near".to_string();
//     let context = get_context(vec![], false, 1, 100, TOKEN_ACCOUNT.to_string());
//     testing_env!(context);
//     let mut contract = sample_contract();
//     let user_data = UserData {
//       balance: 1000,
//       user_rps: contract.last_updated_rps,
//       unclaimed_rewards: 0,
//     };
//     contract.user_map.insert(&test_account, &user_data);
//   }

//   #[test]
//   // should calculate the user rewards of the user after a certain ammount of time
//   fn test_calculate_user_rewards() {
//     let context = get_context(vec![], false, 1, 100, TOKEN_ACCOUNT.to_string());
//     testing_env!(context);
//     let contract = sample_contract();
//   }

//   #[test]
//   // should update the blockchain rps based on the timestamp
//   fn test_calculate_rps() {
//     let context = get_context(vec![], false, 1, 100, TOKEN_ACCOUNT.to_string());
//     testing_env!(context);
//     let contract = sample_contract();
//   }
// }
