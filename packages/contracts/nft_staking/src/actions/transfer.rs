use crate::*;
use near_sdk::json_types::U128;
use near_sdk::{assert_one_yocto, PromiseOrValue};

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
#[serde(tag = "type")]
enum FTRoute {
  OwnerDeposit,
  CollectionOwnerDeposit { collection: NFTCollection },
}

pub struct FTRoutePayload<'a> {
  pub sender_id: AccountId,
  pub token_id: FungibleTokenID,
  pub amount: u128,
  pub msg: &'a str,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
#[serde(tag = "type")]
enum NFTRoute {
  Stake,
}

pub struct NFTRoutePayload<'a> {
  pub sender_id: AccountId,
  pub previous_owner_id: AccountId,
  pub token_id: NonFungibleTokenID,
  pub msg: &'a str,
  pub collection: NFTCollection,
}

#[near_bindgen]
impl Contract {
  #[payable]
  pub fn ft_on_transfer(
    &mut self,
    sender_id: AccountId,
    amount: U128,
    msg: String,
  ) -> PromiseOrValue<U128> {
    assert_one_yocto();
    let token_id = env::predecessor_account_id();
    assert!(
      self.contract_treasury.contains_key(&token_id),
      "Transfered token is not accepted by this contract"
    );

    self.match_ft_route(FTRoutePayload {
      sender_id,
      token_id,
      amount: amount.0,
      msg: &msg.to_owned(),
    });

    PromiseOrValue::Value(U128(0))
  }

  fn match_ft_route(&mut self, payload: FTRoutePayload) {
    let route: FTRoute = serde_json::from_str(payload.msg).expect("");

    match route {
      FTRoute::OwnerDeposit => {
        self.deposit_contract_treasury(payload);
      }

      FTRoute::CollectionOwnerDeposit { collection } => {
        self.deposit_distribution_funds(payload, collection);
      }
    }
  }

  #[payable]
  pub fn nft_on_transfer(
    &mut self,
    sender_id: AccountId,
    previous_owner_id: AccountId,
    token_id: String,
    msg: String,
  ) -> bool {
    assert_one_yocto();
    let collection = NFTCollection::NFTContract {
      account_id: env::predecessor_account_id(),
    };
    assert!(
      self.staking_programs.contains_key(&collection),
      "Transfered token collection is not accepted by this contract"
    );

    let result = self.match_nft_route(NFTRoutePayload {
      sender_id,
      previous_owner_id,
      token_id: (collection.clone(), token_id),
      msg: &msg.to_owned(),
      collection,
    });

    match result {
      Ok(_) => false,
      Err(_) => true,
    }
  }

  fn match_nft_route(&mut self, payload: NFTRoutePayload) -> Result<(), serde_json::Error> {
    let route: NFTRoute = serde_json::from_str(payload.msg).unwrap();

    match route {
      NFTRoute::Stake => {
        self.stake(payload);
      }
    }

    Ok(())
  }
}