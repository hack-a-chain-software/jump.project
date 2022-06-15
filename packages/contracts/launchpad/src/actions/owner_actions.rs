// ### Owner

// 1. Designate new guardians;
// 2. Remove guardian privileges;

use crate::*;

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[payable]
  pub fn assign_guardian(&mut self, new_guardian: AccountId) {
    self.assert_owner();
    assert!(!self.guardians.contains(&new_guardian), "{}", ERR_005);
    let initial_storage = env::storage_usage();
    let contract_account_id = env::current_account_id();
    let mut contract_account = self.internal_get_investor(&contract_account_id).unwrap();
    events::add_guardian(&new_guardian);
    self.guardians.insert(&new_guardian);
    // contract_account.track_storage_usage(initial_storage);
    contract_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&contract_account_id, contract_account);
  }

  #[payable]
  pub fn remove_guardian(&mut self, remove_guardian: AccountId) {
    self.assert_owner();
    assert!(self.guardians.contains(&remove_guardian), "{}", ERR_006);
    let initial_storage = env::storage_usage();
    let contract_account_id = env::current_account_id();
    let mut contract_account = self.internal_get_investor(&contract_account_id).unwrap();
    events::remove_guardian(&remove_guardian);
    self.guardians.remove(&remove_guardian);
    contract_account.track_storage_usage(initial_storage);
    self.internal_update_investor(&contract_account_id, contract_account);
  }
}

#[cfg(test)]
mod tests {

  use crate::tests::*;

  /// assign_guardian
  /// Method must:
  /// 1. Assert caller is owner
  /// 2. Assert 1 yocto near was deposited
  /// 3. Add new guardian to set
  /// #[should_panic(expected = "ERR_001: Only owner can call this method")]
  #[test]
  fn test_assign_guardian_1() {
    
    fn closure_generator(caller: AccountId, deposit: u128, seed: u128) -> impl FnOnce() {
      move || {
        testing_env!(get_context(
          vec![],
          deposit,
          0,
          caller,
          0,
          Gas(300u64 * 10u64.pow(12)),
        ));
        let mut contract_inst = init_contract(seed);
        contract_inst.assign_guardian(USER_ACCOUNT.parse().unwrap());
      }
    }

    let test_cases: [(AccountId, u128, Option<String>); 2] = [
      (USER_ACCOUNT.parse().unwrap(), 1, Some(ERR_001.to_string())), // 1. Assert caller is owner or guardian
      (
        OWNER_ACCOUNT.parse().unwrap(),
        0,
        Some("Requires attached deposit of exactly 1 yoctoNEAR".to_string()),
      ), // 2. Assert 1 yocto near was deposited
    ];

    let mut counter = 0;
    IntoIterator::into_iter(test_cases).for_each(|v| {
      run_test_case(closure_generator(v.0, v.1, counter), v.2);
      counter += 1;
    });
  }

  #[test]
  #[should_panic(expected = "Requires attached deposit of exactly 1 yoctoNEAR")]
  fn test_assign_guardian_2() {
    let context = get_context(
      vec![],
      0,
      0,
      OWNER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let mut contract = init_contract(2);
    contract.assign_guardian(USER_ACCOUNT.parse().unwrap());
  }

  #[test]
  fn test_assign_guardian_3() {
    let context = get_context(
      vec![],
      1,
      0,
      OWNER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let guardian: AccountId = AccountId::try_from(USER_ACCOUNT.to_string()).unwrap();

    let mut contract = init_contract(3);
    assert!(contract.guardians.is_empty());
    contract.assign_guardian(guardian.clone());
    assert!(contract.guardians.contains(&guardian))
  }

  /// assign_guardian
  /// Method must:
  /// 1. Assert caller is owner
  /// 2. Assert 1 yocto near was deposited
  /// 3. Add new guardian to set
  #[test]
  #[should_panic(expected = "ERR_001: Only owner can call this method")]
  fn test_remove_guardian_1() {
    let context = get_context(
      vec![],
      1,
      0,
      USER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let mut contract = init_contract(4);
    contract.remove_guardian(USER_ACCOUNT.parse().unwrap());
  }

  #[test]
  #[should_panic(expected = "Requires attached deposit of exactly 1 yoctoNEAR")]
  fn test_remove_guardian_2() {
    let context = get_context(
      vec![],
      0,
      0,
      OWNER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let guardian: AccountId = AccountId::try_from(USER_ACCOUNT.to_string()).unwrap();

    let mut contract = init_contract(5);
    contract.guardians.insert(&guardian);
    contract.remove_guardian(guardian.clone());
  }

  #[test]
  fn test_remove_guardian_3() {
    let context = get_context(
      vec![],
      1,
      0,
      OWNER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let guardian: AccountId = AccountId::try_from(USER_ACCOUNT.to_string()).unwrap();

    let mut contract = init_contract(6);
    contract.guardians.insert(&guardian);
    assert!(contract.guardians.contains(&guardian));
    contract.remove_guardian(guardian.clone());
    assert!(!contract.guardians.contains(&guardian))
  }
}
