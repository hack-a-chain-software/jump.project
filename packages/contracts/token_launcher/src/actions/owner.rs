use crate::{
  *,
  errors::{ERR_201, ERR_202, ERR_203, ERR_204},
};

#[near_bindgen]
impl Contract {
  /// Returns code at the given hash.
  pub fn get_code(&self, code_hash: Base58CryptoHash) {
    //validate that the owner is calling the function
    assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_202);

    let code_hash: CryptoHash = code_hash.into();
    unsafe {
      // Check that such contract exists.
      assert_eq!(
        sys::storage_has_key(code_hash.len() as _, code_hash.as_ptr() as _),
        1,
        "{}",
        ERR_201
      );
      // Load the hash from storage.
      sys::storage_read(code_hash.len() as _, code_hash.as_ptr() as _, 0);
      // Return as value.
      sys::value_return(u64::MAX as _, 0 as _);
    }
  }

  /// Returns code at the given hash.
  pub fn get_code_with_name(&self, contract_name: String) {
    //validate that the owner is calling the function
    assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_202);

    let code_hash: Base58CryptoHash = self
      .binaries
      .get(&contract_name)
      .expect(ERR_203)
      .contract_hash
      .into();

    let code_hash: CryptoHash = code_hash.into();
    unsafe {
      // Check that such contract exists.
      assert_eq!(
        sys::storage_has_key(code_hash.len() as _, code_hash.as_ptr() as _),
        1,
        "{}",
        ERR_204
      );
      // Load the hash from storage.
      sys::storage_read(code_hash.len() as _, code_hash.as_ptr() as _, 0);
      // Return as value.
      sys::value_return(u64::MAX as _, 0 as _);
    }
  }

  // pub fn edit_binary(
  //   &mut self,
  //   contract_name: String,
  //   contract_hash: CryptoHash,
  //   deployment_cost: U128,
  //   init_fn_name: String,
  //   init_fn_params: String,
  // ) {
  //   //validate that the owner is calling the function
  //   assert_eq!(env::predecessor_account_id(), self.owner, "{}", ERR_202);
  // }
}
