use crate::*;
use crate::errors::{ERR_001, ERR_002};
use crate::ext_interface::{ext_token_contract, ext_self};

const BASE_GAS: Gas = Gas(50_000_000_000_000);
const FT_TRANSFER_GAS: Gas = Gas(50_000_000_000_000);
const REVERT_CALLBACK_GAS: Gas = Gas(50_000_000_000_000);

// Implement custom methods
#[near_bindgen]
impl Contract {
    pub fn ft_on_transfer(&mut self, sender_id: String, amount: U128, msg: String) {
        assert_eq!(env::predecessor_account_id(), self.base_token, "{}", ERR_002);
        match msg.as_str() {
            "mint" => {
                self.internal_mint_x_token(amount.0, sender_id.try_into().unwrap());
            },
            "deposit_profit" => {
                self.internal_deposit_jump_profits(amount.0)
            },
            _ => panic!(ERR_001)
        }
    }

    #[payable]
    pub fn burn_x_token(&mut self, quantity_to_burn: U128) {
        assert_one_yocto();
        assert!(env::prepaid_gas() >= BASE_GAS + FT_TRANSFER_GAS + REVERT_CALLBACK_GAS);
        let account = env::predecessor_account_id();
        let base_token_quantity = self.internal_burn_x_token(quantity_to_burn.0, account);
        ext_token_contract::ext(self.base_token)
            .with_static_gas(FT_TRANSFER_GAS)
            .with_attached_deposit(1)
            .ft_transfer(account.to_string(), U128(base_token_quantity), "xToken withdraw".to_string())
        .then(
            ext_self::ext(env::current_account_id())
                .with_static_gas(REVERT_CALLBACK_GAS)
                .callback_base_token_transfer(quantity_to_burn, account, U128(base_token_quantity))
        );
    }

}
