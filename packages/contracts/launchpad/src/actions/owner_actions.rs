// ### Owner

// 1. Designate new guardians;
// 2. Remove guardian privileges;

use crate::*;

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[payable]
  pub fn assign_guardian(&mut self, new_guardian: AccountId) -> bool {
    self.assert_owner();
    events::add_guardian(&new_guardian);
    self.guardians.insert(&new_guardian)
  }

  #[payable]
  pub fn remove_guardian(&mut self, remove_guardian: AccountId) -> bool {
    self.assert_owner();
    events::remove_guardian(&remove_guardian);
    self.guardians.remove(&remove_guardian)
  }
}

#[cfg(test)]
mod tests {

  use crate::tests::*;
  pub use super::*;

  /// assign_guardian
  /// Method must:
  /// 1. Assert caller is owner
  /// 2. Assert 1 yocto near was deposited
  /// 3. Add new guardian to set
  #[test]
  #[should_panic(expected = "ERR_001: Only owner can call this method")]
  fn test_assign_guardian_1() {
    let context = get_context(
      vec![],
      1,
      0,
      USER_ACCOUNT.parse().unwrap(),
      0,
      Gas(300u64 * 10u64.pow(12)),
    );
    testing_env!(context);

    let mut contract = init_contract();
    contract.assign_guardian(USER_ACCOUNT.parse().unwrap());
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

    let mut contract = init_contract();
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

    let mut contract = init_contract();
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

    let mut contract = init_contract();
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
  
      let mut contract = init_contract();
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

    let mut contract = init_contract();
    contract.guardians.insert(&guardian);
    assert!(contract.guardians.contains(&guardian));
    contract.remove_guardian(guardian.clone());
    assert!(!contract.guardians.contains(&guardian))
  }
}
