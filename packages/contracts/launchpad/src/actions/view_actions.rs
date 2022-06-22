use crate::*;

#[near_bindgen]
impl Contract {
  pub fn view_listing(&self, listing_id: U64) -> Option<Listing> {
    match self.listings.get(listing_id.0) {
      Some(listing) => Some(listing.into_current()),
      None => None,
    }
  }

  pub fn view_listings_quantity(&self) -> U64 {
    U64(self.listings.len())
  }

  pub fn view_investor(&self, account_id: AccountId) -> Option<Investor> {
    self.internal_get_investor(&account_id)
  }

  pub fn view_investor_allowance(&self, account_id: AccountId, listing_id: Option<U64>) -> U64 {
    if let Some(investor) = self.internal_get_investor(&account_id) {
      match listing_id {
        Some(listing_id) => {
          let listing = self.internal_get_listing(listing_id.0);
          let current_sale_phase = listing.get_current_sale_phase();
          let previous_allocations_bought = investor
            .allocation_count
            .get(&listing.listing_id)
            .unwrap_or([0, 0]);
          U64(self.check_investor_allowance(
            &investor,
            &current_sale_phase,
            previous_allocations_bought[0],
            &listing,
          ))
        }
        None => {
          let membership_level =
            investor.get_current_membership_level(&self.contract_settings.tiers_minimum_tokens);
          self.contract_settings.tiers_entitled_allocations[membership_level as usize - 1]
        }
      }
    } else {
      U64(0)
    }
  }

  pub fn view_investor_allocation(
    &self,
    account_id: AccountId,
    listing_id: U64,
  ) -> Option<[U64; 2]> {
    match self.internal_get_investor(&account_id) {
      Some(investor) => match investor.allocation_count.get(&listing_id.0) {
        Some(alloc) => Some([U64(alloc[0]), U64(alloc[1])]),
        None => None,
      },
      None => None,
    }
  }

  pub fn view_iter_investor_listings(
    &self,
    account_id: AccountId,
    start: U64,
    pagination: U64,
  ) -> Option<Vec<U64>> {
    match self.internal_get_investor(&account_id) {
      Some(investor) => Some(
        investor
          .allocation_count
          .keys()
          .skip(start.0 as usize)
          .take(pagination.0 as usize)
          .map(|v| U64(v))
          .collect(),
      ),
      None => None,
    }
  }

  pub fn view_contract_settings(&self) -> ContractSettings {
    self.contract_settings.clone()
  }

  pub fn view_contract_treasury_length(&self) -> U64 {
    U64(self.treasury.len())
  }

  pub fn view_contract_treasury_balance(
    &self,
    start: U64,
    pagination: U64,
  ) -> Vec<(TokenType, U128)> {
    self
      .treasury
      .iter()
      .skip(start.0 as usize)
      .take(pagination.0 as usize)
      .map(|v| (v.0, U128(v.1)))
      .collect()
  }
}
