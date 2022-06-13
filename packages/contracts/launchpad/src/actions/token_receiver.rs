/// Implement receivers for NEP-141
/// Redirects to other methods according to
/// msg logic
use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde", tag = "type")]
pub enum CallType {
  FundListing { listing_id: U64 },
  BuyAllocation { listing_id: U64 },
}


#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[allow(unreachable_patterns)]
  pub fn ft_on_transfer(&mut self, sender_id: AccountId, amount: U128, msg: String) -> U128 {
    match serde_json::from_str::<CallType>(&msg).expect(ERR_301) {
      CallType::FundListing { listing_id } => {
        self.fund_listing(
          listing_id.0,
          amount.0,
          TokenType::FT {
            account_id: env::predecessor_account_id(),
          },
        );
        U128(0)
      },
      CallType::BuyAllocation { listing_id } => {
        U128(self.buy_allocation(listing_id.0, amount.0, sender_id))
      },
      _ => unimplemented!(),
    }
  }
}
