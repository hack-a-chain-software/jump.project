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