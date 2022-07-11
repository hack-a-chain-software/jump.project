use crate::*;
use crate::ext_interface::{ext_token_contract, ext_self};

const FT_TRANSFER_GAS: Gas = Gas(0);
const FT_TRANSFER_CALLBACK_GAS: Gas = Gas(0);

#[near_bindgen]
impl Contract {
  pub fn withdraw_locked_tokens(&mut self, vesting_id: U64) -> Promise {
    let account_id = env::predecessor_account_id();
    let vesting_id = vesting_id.0;
    let mut vesting_vector = self.vesting_schedules.get(&account_id).expect(ERR_001);
    let mut vesting = vesting_vector.get(vesting_id).expect(ERR_101);

    let value_to_withdraw = vesting.withdraw_available(env::block_timestamp());
    vesting_vector.replace(vesting_id, &vesting);

    self.ft_functionality.internal_withdraw(&account_id, value_to_withdraw);

    ext_token_contract::ext(self.contract_config.get().unwrap().base_token)
      .with_static_gas(FT_TRANSFER_GAS)
      .with_attached_deposit(1)
      .ft_transfer(
        account_id.to_string(),
        U128(value_to_withdraw),
        "locked token withdraw".to_string(),
      )
      .then(
        ext_self::ext(env::current_account_id())
          .with_static_gas(FT_TRANSFER_CALLBACK_GAS)
          .callback_base_token_transfer(account_id, U128(value_to_withdraw), U64(vesting_id)),
      )
  }
}