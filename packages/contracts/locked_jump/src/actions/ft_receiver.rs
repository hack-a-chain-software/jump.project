use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde", tag = "type")]
pub enum TransactionType {
  Mint {
    account_id: AccountId,
  },
  BuyFastPass {
    account_id: AccountId,
    vesting_index: U64,
  },
}

#[near_bindgen]
impl Contract {
  #[allow(unused_variables)]
  pub fn ft_on_transfer(&mut self, sender_id: String, amount: String, msg: String) -> U128 {
    assert_eq!(
      env::predecessor_account_id(),
      self.contract_config.get().unwrap().base_token,
      "{}",
      ERR_004
    );
    let amount: u128 = amount.parse().unwrap();
    match serde_json::from_str::<TransactionType>(msg.as_str()).expect(ERR_006) {
      TransactionType::Mint { account_id } => self.mint_locked_tokens(account_id, amount),
      TransactionType::BuyFastPass {
        account_id,
        vesting_index,
      } => self.buy_fast_pass(account_id, vesting_index.0, amount),
    }
  }
}

impl Contract {
  pub fn mint_locked_tokens(&mut self, recipient: AccountId, amount: u128) -> U128 {
    assert!(self.minters.contains(&recipient), "{}", ERR_005);

    self.ft_functionality.internal_deposit(&recipient, amount);

    FtMint {
      owner_id: &recipient,
      amount: &U128(amount),
      memo: Some("Mint by locking base tokens"),
    }
    .emit();
    U128(0)
  }

  pub fn buy_fast_pass(&mut self, account_id: AccountId, vesting_index: u64, amount: u128) -> U128 {
    let mut vesting_vector = self.vesting_schedules.get(&account_id).expect(ERR_001);
    let mut vesting = vesting_vector.get(vesting_index).expect(ERR_101);
    let pass_cost = self.get_fast_pass_cost(&vesting);
    assert!(amount >= pass_cost, "{}. Needs {}", ERR_102, pass_cost);

    vesting.buy_fastpass(
      env::block_timestamp(),
      self.contract_config.get().unwrap().fast_pass_acceleration.0,
    );
    vesting_vector.replace(vesting_index, &vesting);

    U128(amount - pass_cost)
  }
}
