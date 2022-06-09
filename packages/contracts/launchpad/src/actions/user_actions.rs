// ### Normal users

// 1. join sale_1 (if they own xJump);
// 2. join sale_2;
// 3. withdraw unlocked project_tokens from a listing they invested in;
// 4. withdraw vested project_tokens from a listing they invested in;
// 5. withdraw price_tokens from a listing they invested in in case the listing is cancelled;

use crate::*;

#[near_bindgen]
impl Contract {}

/// methods to be called through the token_receiver
impl Contract {
    pub fn investor_updated_ranking(&mut self) {}
}