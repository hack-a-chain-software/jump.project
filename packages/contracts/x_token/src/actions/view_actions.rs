use crate::*;
use std::collections::{HashMap};

#[near_bindgen]
impl Contract {
    pub fn view_token_ratio(&self) -> HashMap<String, U128> {
        let return_value: HashMap<String, U128> = HashMap::new();
        return_value.insert("x_token".to_string(), U128(self.ft_functionality.total_supply));
        return_value.insert(self.base_token.to_string(), U128(self.base_token_treasury));
        return_value
    }

}
