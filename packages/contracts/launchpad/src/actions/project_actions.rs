// ### Project owner

// 1. Send funds to their listing in order to fill out the treasury and allow the presale to start;
// 2. Withdraw the price token received after the end of presale (must discount the needed price_token for the dex liquidity pool);
// 3. Withdraw remaining project_tokens after the end of presale;
// 4. Withdraw all funds in case of cancelled listing;
use crate::*;

#[allow(dead_code)]
#[near_bindgen]
impl Contract {
    #[payable]
    pub fn withdraw_tokens_after_sale(&mut self, listing_id: U64) {
        let listing_id = listing_id.0;
        let mut listing = self.assert_project_owner(listing_id);
        self.internal_withdraw_project_funds(&mut listing, listing_id);
    }
}

/// Actions to be called through token_receiver functions
impl Contract {
    pub fn fund_listing(&mut self, listing_id: u64, token_quantity: u128, token_type: TokenType) {
        let mut listing = self.listings.get(listing_id).expect(ERR_003).into_current();

        // refactor, create method in VListing
        listing.assert_funding_token(token_type, token_quantity);

        // create VListing method to fund listing
        listing.fund_listing();
        self.listings.replace(listing_id, &VListing::V1(listing));
    }
}