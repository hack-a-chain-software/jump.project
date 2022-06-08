/// Implement receivers for NEP-141
/// Redirects to other methods according to
/// msg logic
use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
#[serde(tag = "type")]
pub enum CallType {
  FundListing { listing_id: U64 },
}

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
  #[allow(unused_variables)]
  #[allow(unreachable_patterns)]
  pub fn ft_on_transfer(&mut self, sender_id: String, amount: U128, msg: String) -> U128 {
    let call_type: CallType = serde_json::from_str(&msg).expect("");
    match call_type {
      CallType::FundListing { listing_id } => self.fund_listing(
        listing_id.0,
        amount.0,
        TokenType::FT {
          account_id: env::predecessor_account_id(),
        },
      ),
      _ => unimplemented!(),
    }
    U128(0)
  }
}
