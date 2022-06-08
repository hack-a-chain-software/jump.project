use crate::errors::{ERR_001, ERR_002};
use crate::ext_interface::{ext_self, ext_token_contract};
use crate::*;

const BASE_GAS: Gas = Gas(50_000_000_000_000);
const FT_TRANSFER_GAS: Gas = Gas(50_000_000_000_000);
const REVERT_CALLBACK_GAS: Gas = Gas(50_000_000_000_000);

// Implement custom methods
#[allow(dead_code)]
#[near_bindgen]
impl Contract {
    pub fn ft_on_transfer(&mut self, sender_id: String, amount: U128, msg: String) {
        assert_eq!(
            env::predecessor_account_id(),
            self.base_token,
            "{}",
            ERR_002
        );
        match msg.as_str() {
            "mint" => {
                self.internal_mint_x_token(amount.0, sender_id.try_into().unwrap());
            }
            "deposit_profit" => self.internal_deposit_jump_profits(amount.0),
            _ => panic!("{}", ERR_001),
        }
    }

    #[payable]
    pub fn burn_x_token(&mut self, quantity_to_burn: U128) {
        assert_one_yocto();
        assert!(env::prepaid_gas() >= BASE_GAS + FT_TRANSFER_GAS + REVERT_CALLBACK_GAS);
        let account = env::predecessor_account_id();
        let base_token_quantity = self.internal_burn_x_token(quantity_to_burn.0, account.clone());
        ext_token_contract::ext(self.base_token.clone())
            .with_static_gas(FT_TRANSFER_GAS)
            .with_attached_deposit(1)
            .ft_transfer(
                account.to_string(),
                U128(base_token_quantity),
                "xToken withdraw".to_string(),
            )
            .then(
                ext_self::ext(env::current_account_id())
                    .with_static_gas(REVERT_CALLBACK_GAS)
                    .callback_base_token_transfer(
                        quantity_to_burn,
                        account,
                        U128(base_token_quantity),
                    ),
            );
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use crate::tests::*;
    use crate::*;

    #[test]
    #[should_panic(
        expected = "assertion failed: `(left == right)`\n  left: `0`,\n right: `1`: Requires attached deposit of exactly 1 yoctoNEAR"
    )]
    fn test_burn_x_token() {}

    #[test]
    fn test_view_token_ratio() {
        let context = get_context(vec![], 0, 0, OWNER_ACCOUNT.clone().parse().unwrap()); // vec!() -> da pra inicializar assim, tem otimizacao ( macro vec)
        testing_env!(context);

        let initial_amount_of_xtoken: u128 = 10;
        let initial_amount_of_jump: u128 = 100;

        let mut contract = init_contract(initial_amount_of_jump.clone());

        contract
            .ft_functionality
            .internal_register_account(&SIGNER_ACCOUNT.parse().unwrap());

        contract.ft_functionality.internal_deposit(
            &SIGNER_ACCOUNT.parse().unwrap(),
            initial_amount_of_xtoken.clone(),
        );
    }
}
