use near_sdk::AccountId;
use serde::{Deserialize, Serialize};

use crate::staking::StakingProgram;
use crate::types::*;
use crate::Contract;

#[derive(Clone, Copy, Serialize, Deserialize)]
pub enum TreasuryOperation {
  ContractToCollection { amount: Option<u128> },
  CollectionToContract { amount: Option<u128> },
  CollectionToDistribution { amount: Option<u128> },
  BeneficiaryToCollection,
}

impl Contract {
  fn assert_authorized_operation(
    &self,
    operation: TreasuryOperation,
    operator: &AccountId,
    staking_program: &StakingProgram,
    token_id: &FungibleTokenID,
  ) {
    match &operation {
      TreasuryOperation::CollectionToContract { amount: _ }
      | TreasuryOperation::ContractToCollection { amount: _ } => {
        self.only_guardians(operator);
        self.only_contract_tokens(token_id);
        staking_program.only_non_program_tokens(token_id);
      }

      TreasuryOperation::CollectionToDistribution { amount: _ }
      | TreasuryOperation::BeneficiaryToCollection => {
        if staking_program.is_program_token(token_id) {
          staking_program.only_collection_owner(operator);
        } else if self.is_contract_token(token_id) {
          self.only_guardians(operator);
          staking_program.only_non_program_tokens(token_id);
        } else {
          panic!("Token does not belong to staking program");
        }
      }
    }
  }

  fn realocate_treasury(
    &mut self,
    operation: TreasuryOperation,
    operator: &AccountId,
    staking_program: &mut StakingProgram,
    token_id: FungibleTokenID,
  ) {
    self.assert_authorized_operation(operation, operator, &staking_program, &token_id);

    let contract_treasury = self.contract_treasury.entry(token_id.clone()).or_insert(0);

    let collection_treasury = staking_program
      .collection_treasury
      .entry(token_id.clone())
      .or_insert(0);

    match operation {
      TreasuryOperation::ContractToCollection { amount } => {
        let amount = amount.unwrap_or(*contract_treasury);
        assert!(
          amount <= *contract_treasury,
          "Insufficient contract treasury"
        );
        *contract_treasury -= amount;
        *collection_treasury += amount;
      }
      TreasuryOperation::CollectionToContract { amount } => {
        let amount = amount.unwrap_or(*collection_treasury);
        assert!(
          amount <= *collection_treasury,
          "Insufficient collection treasury"
        );
        *collection_treasury -= amount;
        *contract_treasury += amount;
      }
      TreasuryOperation::CollectionToDistribution { amount } => {
        let amount = amount.unwrap_or(*collection_treasury);
        assert!(
          amount <= *collection_treasury,
          "Insufficient collection treasury"
        );
        *collection_treasury -= amount;
        staking_program.deposit_distribution_funds(&token_id, amount);
      }
      TreasuryOperation::BeneficiaryToCollection => {
        // TODO: ideally this would call StakingProgram::withdraw_beneficiary_funds
        let amount = staking_program.farm.withdraw_beneficiary_funds(&token_id);

        *collection_treasury += amount;
      }
    }
  }

  pub fn move_treasury(
    &mut self,
    operation: TreasuryOperation,
    operator: &AccountId,
    collection: &NFTCollection,
    token_id: FungibleTokenID,
  ) {
    let mut staking_program = self.staking_programs.get(&collection).unwrap();

    self.assert_authorized_operation(operation, operator, &staking_program, &token_id);
    self.realocate_treasury(operation, operator, &mut staking_program, token_id);

    self.staking_programs.insert(&collection, &staking_program);
  }
}
