use crate::*;
use crate::ext_interface::{ext_token_contract, ext_self};

#[near_bindgen]
impl Contract {
  pub fn add_minter(&mut self, new_minter: AccountId) {
    self.only_owner(&env::predecessor_account_id());
    self.minters.insert(&new_minter);
  }

  pub fn remove_minter(&mut self, remove_minter: AccountId) {
    self.only_owner(&env::predecessor_account_id());
    self.minters.remove(&remove_minter);
  }

  pub fn alter_config(&mut self, new_config: ContractConfig) {
    self.only_owner(&env::predecessor_account_id());
    self.contract_config.set(&new_config);
  }

  pub fn send_pending_tokens_to_xtoken(&mut self) -> Promise {
    let tokens = self.fast_pass_receivals.0;
    self.fast_pass_receivals = U128(0);

    ext_token_contract::ext(self.contract_config.get().unwrap().base_token.clone())
      .with_static_gas(Gas(1))
      .with_attached_deposit(1)
      .ft_transfer_call(
        self
          .contract_config
          .get()
          .unwrap()
          .fast_pass_beneficiary
          .to_string(),
        U128(tokens),
        Some("fast pass purchase".to_string()),
        "deposit_profit".to_string(),
      )
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(Gas(1))
          .callback_send_to_xtoken(U128(tokens)),
      )
  }
}

#[cfg(test)]
mod tests {

  // use crate::tests::*;

  // /// assign_guardian
  // /// Method must:
  // /// 1. Assert caller is owner
  // /// 2. Assert 1 yocto near was deposited
  // /// 3. Add new guardian to set
  // /// 4. emit new guardian event
  // #[test]
  // fn test_assign_guardian() {
  //   fn closure_generator(caller: AccountId, deposit: u128, seed: u128) -> impl FnOnce() {
  //     move || {
  //       testing_env!(get_context(
  //         vec![],
  //         deposit,
  //         0,
  //         caller,
  //         0,
  //         Gas(300u64 * 10u64.pow(12)),
  //       ));

  //       let guardian_account: AccountId = USER_ACCOUNT.parse().unwrap();

  //       let mut contract = init_contract(seed);

  //       assert!(!contract.guardians.contains(&guardian_account));
  //       contract.assign_guardian(guardian_account.clone());
  //       assert!(contract.guardians.contains(&guardian_account));
  //       let logs = get_logs();
  //       assert_eq!(logs.len(), 1);

  //       let event_log = logs.get(0).unwrap();
  //       let serde_blob: serde_json::Value =
  //         serde_json::from_str(event_log.chars().skip(11).collect::<String>().as_str()).unwrap();

  //       assert_eq!(serde_blob["standard"], "jump_launchpad");
  //       assert_eq!(serde_blob["version"], "1.0.0");
  //       assert_eq!(serde_blob["event"], "create_guardian");
  //       assert_eq!(
  //         serde_blob["data"][0]["new_guardian"],
  //         guardian_account.to_string()
  //       );
  //     }
  //   }

  //   let test_cases = [
  //     // 1. Assert caller is owner or guardian
  //     (USER_ACCOUNT.parse().unwrap(), 1, Some(ERR_001.to_string())),
  //     // 2. Assert 1 yocto near was deposited
  //     (
  //       OWNER_ACCOUNT.parse().unwrap(),
  //       0,
  //       Some("Requires attached deposit of exactly 1 yoctoNEAR".to_string()),
  //     ),
  //     // 3. Add new guardian to set
  //     // 4. emit new guardian event
  //     (OWNER_ACCOUNT.parse().unwrap(), 1, None),
  //   ];

  //   let mut counter = 0;
  //   IntoIterator::into_iter(test_cases).for_each(|v| {
  //     run_test_case(closure_generator(v.0, v.1, counter), v.2);
  //     counter += 1;
  //   });
  // }
}
