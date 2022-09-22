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

  fn reallocate_treasury(
    &mut self,
    operation: TreasuryOperation,
    staking_program: &mut StakingProgram,
    token_id: FungibleTokenID,
  ) {
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
    self.reallocate_treasury(operation, &mut staking_program, token_id);

    self.staking_programs.insert(&collection, &staking_program);
  }
}

#[allow(unused_imports)]
#[cfg(test)]
mod tests {
  use std::{collections::HashMap, str::FromStr};

  use near_sdk::{test_utils::VMContextBuilder, testing_env};
  use rstest::{fixture, rstest};

  use super::*;
  use crate::{farm::Farm, staking, Contract, StakingProgram};

  const INITIAL_CONTRACT_TREASURY: u128 = 50;
  const INITIAL_COLLECTION_TREASURY: u128 = 50;
  const INTIIAL_DISTRIBUTION_FUNDS: u128 = 50;
  const INITIAL_BENEFICIARY_FUNDS: u128 = 50;

  fn get_context() -> VMContextBuilder {
    VMContextBuilder::new()
  }

  #[fixture]
  fn guardian() -> AccountId {
    AccountId::from_str("guardian.near").unwrap()
  }

  #[fixture]
  fn contract_token() -> FungibleTokenID {
    AccountId::from_str("contract_token.near").unwrap()
  }

  #[fixture]
  fn program_token() -> FungibleTokenID {
    AccountId::from_str("program_token.near").unwrap()
  }

  #[fixture]
  fn collection() -> NFTCollection {
    NFTCollection::NFTContract {
      account_id: AccountId::from_str("collection.near").unwrap(),
    }
  }

  #[fixture]
  fn collection_owner() -> AccountId {
    AccountId::from_str("collection_owner.near").unwrap()
  }

  #[fixture]
  fn farm(
    collection: NFTCollection,
    contract_token: FungibleTokenID,
    program_token: FungibleTokenID,
  ) -> Farm {
    let mut collection_round_reward = HashMap::new();
    collection_round_reward.insert(contract_token.clone(), 10);
    collection_round_reward.insert(program_token.clone(), 10);

    let mut farm = Farm::new(collection.clone(), collection_round_reward, 5);

    farm
      .distributions
      .entry(contract_token)
      .and_modify(|dist| dist.beneficiary = INITIAL_BENEFICIARY_FUNDS);
    farm
      .distributions
      .entry(program_token)
      .and_modify(|dist| dist.beneficiary = INITIAL_BENEFICIARY_FUNDS);

    farm
  }

  #[fixture]
  fn staking_program(
    farm: Farm,
    collection: NFTCollection,
    collection_owner: AccountId,
    contract_token: FungibleTokenID,
    program_token: FungibleTokenID,
  ) -> StakingProgram {
    let mut staking_program = StakingProgram::new(
      farm,
      collection,
      collection_owner,
      program_token.clone(),
      0,
      0,
    );

    staking_program
      .collection_treasury
      .insert(contract_token.clone(), INITIAL_COLLECTION_TREASURY);
    staking_program
      .collection_treasury
      .insert(program_token.clone(), INITIAL_COLLECTION_TREASURY);

    staking_program.deposit_distribution_funds(&contract_token, INTIIAL_DISTRIBUTION_FUNDS);
    staking_program.deposit_distribution_funds(&program_token, INTIIAL_DISTRIBUTION_FUNDS);

    staking_program
  }

  #[fixture]
  fn owner() -> AccountId {
    AccountId::from_str("owner.near").unwrap()
  }

  #[fixture]
  fn contract(owner: AccountId, contract_token: FungibleTokenID, guardian: AccountId) -> Contract {
    let mut context = get_context();
    context.attached_deposit(1);
    context.predecessor_account_id(owner.clone());
    testing_env!(context.build());

    let mut contract = Contract::new(owner, vec![contract_token.clone()]);

    contract.add_guardian(guardian);

    contract
      .contract_treasury
      .entry(contract_token)
      .and_modify(|balance| *balance = INITIAL_CONTRACT_TREASURY);

    contract
  }

  #[rstest]
  #[case::guardian_ct_contract_to_collection(
    TreasuryOperation::ContractToCollection{ amount: Some(0) },
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_collection_to_contract(
    TreasuryOperation::CollectionToContract{ amount: Some(0) },
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution{ amount: Some(0) },
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    guardian(),
    contract_token()
  )]
  #[case::collection_owner_pt_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution{ amount: Some(0) },
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_pt_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    collection_owner(),
    program_token()
  )]
  fn test_authorized_operation(
    contract: Contract,
    staking_program: StakingProgram,
    #[case] operation: TreasuryOperation,
    #[case] operator: AccountId,
    #[case] token_id: FungibleTokenID,
  ) {
    contract.assert_authorized_operation(operation, &operator, &staking_program, &token_id);
  }

  #[rstest]
  #[case::guardian_pt_contract_to_collection(
    TreasuryOperation::ContractToCollection { amount: Some(0) },
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_collection_to_contract(
    TreasuryOperation::CollectionToContract { amount: Some(0) },
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution { amount: Some(0) },
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    guardian(),
    program_token()
  )]
  #[case::collection_owner_ct_contract_to_collection(
    TreasuryOperation::ContractToCollection { amount: Some(0) },
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_pt_contract_to_collection(
    TreasuryOperation::ContractToCollection { amount: Some(0) },
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_ct_collection_to_contract(
    TreasuryOperation::CollectionToContract { amount: Some(0) },
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_pt_collection_to_contract(
    TreasuryOperation::CollectionToContract { amount: Some(0) },
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_ct_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution { amount: Some(0) },
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_ct_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    collection_owner(),
    contract_token()
  )]
  fn test_unauthorized_operation(
    contract: Contract,
    staking_program: StakingProgram,
    #[case] operation: TreasuryOperation,
    #[case] operator: AccountId,
    #[case] token_id: FungibleTokenID,
  ) {
    std::panic::set_hook(Box::new(|_| {}));

    let panicked = std::panic::catch_unwind(|| {
      contract.assert_authorized_operation(operation, &operator, &staking_program, &token_id);
    });

    assert!(panicked.is_err());
  }

  #[rstest]
  #[case::contract_to_collection_amount(
    TreasuryOperation::ContractToCollection { amount: Some(5) },
    (45, 55, 50, 50)
  )]
  #[case::contract_to_collection(
    TreasuryOperation::ContractToCollection { amount: None },
    (0, 100, 50, 50)
  )]
  #[case::collection_to_contract_amount(
    TreasuryOperation::CollectionToContract { amount: Some(5) },
    (55, 45, 50, 50)
  )]
  #[case::collection_to_contract(
    TreasuryOperation::CollectionToContract { amount: None },
    (100, 0, 50, 50)
  )]
  #[case::collection_to_distribution_amount(
    TreasuryOperation::CollectionToDistribution { amount: Some(5) },
    (50, 45, 55, 50)
  )]
  #[case::collection_to_distribution(
    TreasuryOperation::CollectionToDistribution { amount: None },
    (50, 0, 100, 50)
  )]
  #[case::beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    (50, 100, 50, 0)
  )]
  fn test_reallocate_treasury(
    mut contract: Contract,
    mut staking_program: StakingProgram,
    contract_token: FungibleTokenID,
    #[case] operation: TreasuryOperation,
    #[case] expected: (u128, u128, u128, u128),
  ) {
    contract.reallocate_treasury(operation, &mut staking_program, contract_token.clone());

    let updated_contract_treasury = contract.contract_treasury.get(&contract_token).unwrap();
    let updated_collection_treasury = staking_program
      .collection_treasury
      .get(&contract_token)
      .unwrap();

    let updated_distribution = staking_program
      .farm
      .distributions
      .get(&contract_token)
      .unwrap();
    let updated_distribution_funds = updated_distribution.undistributed;
    let updated_beneficiary_funds = updated_distribution.beneficiary;

    assert_eq!(updated_contract_treasury, &expected.0);
    assert_eq!(updated_collection_treasury, &expected.1);
    assert_eq!(updated_distribution_funds, expected.2);
    assert_eq!(updated_beneficiary_funds, expected.3);
  }
}
