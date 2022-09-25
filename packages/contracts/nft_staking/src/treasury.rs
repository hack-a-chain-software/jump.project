use near_sdk::AccountId;
use serde::{Deserialize, Serialize};

use crate::staking::StakingProgram;
use crate::types::*;
use crate::Contract;

#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum TreasuryOperation {
  ContractToCollection,
  CollectionToContract,
  CollectionToDistribution,
  BeneficiaryToCollection,
  /*
   *   Maybe this operation does not fit here with the others, it's possible
   * that we should create a different category of deposit operations. But for now
   * I think the simplest and most effective solution is to have it here, considering
   * there's no reason for anyone to deposit to a treasury.
   */
  DepositToDistribution,
  DepositToContract,
}

impl Contract {
  fn assert_authorized_operation(
    &self,
    operation: TreasuryOperation,
    operator: &AccountId,
    staking_program: Option<&StakingProgram>,
    token_id: &FungibleTokenID,
  ) {
    match &operation {
      TreasuryOperation::CollectionToContract | TreasuryOperation::ContractToCollection => {
        let staking_program = staking_program.unwrap();
        self.only_guardians(operator);
        self.only_contract_tokens(token_id);
        staking_program.only_non_program_tokens(token_id);
      }

      TreasuryOperation::CollectionToDistribution
      | TreasuryOperation::BeneficiaryToCollection
      | TreasuryOperation::DepositToDistribution => {
        let staking_program = staking_program.unwrap();
        self.assert_authorized_operator(operator, staking_program, token_id);
      }

      TreasuryOperation::DepositToContract => (),
    }
  }

  fn reallocate_treasury(
    &mut self,
    operation: TreasuryOperation,
    staking_program: Option<&mut StakingProgram>,
    token_id: FungibleTokenID,
    amount: Option<u128>,
  ) {
    
      
    match operation {
      TreasuryOperation::ContractToCollection => {
        let contract_treasury = self.contract_treasury.entry(token_id.clone()).or_insert(0);
        let amount = amount.unwrap_or(*contract_treasury);
        let collection_treasury = staking_program.unwrap().collection_treasury
        .entry(token_id.clone())
        .or_insert(0);

        assert!(
          amount <= *contract_treasury,
          "Insufficient contract treasury, amount: {}, treasury: {}",
          amount,
          *contract_treasury
        );
        *contract_treasury -= amount;
        *collection_treasury += amount;
      }
      TreasuryOperation::CollectionToContract => {
        let contract_treasury = self.contract_treasury.entry(token_id.clone()).or_insert(0);
        let collection_treasury = staking_program.unwrap().collection_treasury
        .entry(token_id.clone())
        .or_insert(0);
        let amount = amount.unwrap_or(*collection_treasury);
        assert!(
          amount <= *collection_treasury,
          "Insufficient collection treasury"
        );
        *collection_treasury -= amount;
        *contract_treasury += amount;
      }
      TreasuryOperation::CollectionToDistribution => {
        let staking_program = staking_program.unwrap();
        let collection_treasury = staking_program.collection_treasury
        .entry(token_id.clone())
        .or_insert(0);
        let amount = amount.unwrap_or(*collection_treasury);
        assert!(
          amount <= *collection_treasury,
          "Insufficient collection treasury"
        );
        *collection_treasury -= amount;
        staking_program.deposit_distribution_funds(&token_id, amount);
      }
      TreasuryOperation::BeneficiaryToCollection => {
        let staking_program = staking_program.unwrap();
        let collection_treasury = staking_program.collection_treasury
        .entry(token_id.clone())
        .or_insert(0);
        assert!(
          amount.is_none(),
          "This operation does not support the parameter 'amount'"
        );
        // TODO: ideally this would call StakingProgram::withdraw_beneficiary_funds
        let amount = staking_program.farm.withdraw_beneficiary_funds(&token_id);

        *collection_treasury += amount;
      }
      TreasuryOperation::DepositToDistribution => {
        let staking_program = staking_program.unwrap();
        assert!(
          amount.is_some(),
          "This operation needs the parameter 'amount'"
        );
        staking_program.deposit_distribution_funds(&token_id, amount.unwrap());
      }
      TreasuryOperation::DepositToContract => {
        let contract_treasury = self.contract_treasury.entry(token_id.clone()).or_insert(0);
        assert!(
          amount.is_some(),
          "This operation needs the parameter 'amount'"
        );
        *contract_treasury += amount.unwrap();
      }
    }
  }

  pub fn move_treasury(
    &mut self,
    operation: TreasuryOperation,
    operator: &AccountId,
    collection: Option<&NFTCollection>,
    token_id: FungibleTokenID,
    amount: Option<u128>,
  ) {
    if let Some(collection) = collection {
      let mut staking_program = self.staking_programs.get(&collection).unwrap();

      self.assert_authorized_operation(operation, operator, Some(&staking_program), &token_id);
      self.reallocate_treasury(operation, Some(&mut staking_program), token_id, amount);

      self.staking_programs.insert(&collection, &staking_program);
    } else {
      self.assert_authorized_operation(operation, operator, None, &token_id);
      self.reallocate_treasury(operation, None, token_id, amount);
    }
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

    let mut farm = Farm::new(collection.clone(), collection_round_reward, 5, 0);

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
    TreasuryOperation::ContractToCollection,
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_collection_to_contract(
    TreasuryOperation::CollectionToContract,
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution,
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    guardian(),
    contract_token()
  )]
  #[case::guardian_ct_deposit_to_distribution(
    TreasuryOperation::DepositToDistribution,
    guardian(),
    contract_token()
  )]
  #[case::collection_owner_pt_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution,
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_pt_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_pt_deposit_to_distribution(
    TreasuryOperation::DepositToDistribution,
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
    contract.assert_authorized_operation(operation, &operator, Some(&staking_program), &token_id);
  }

  #[rstest]
  #[case::guardian_pt_contract_to_collection(
    TreasuryOperation::ContractToCollection,
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_collection_to_contract(
    TreasuryOperation::CollectionToContract,
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution,
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    guardian(),
    program_token()
  )]
  #[case::guardian_pt_deposit_to_distribution(
    TreasuryOperation::DepositToDistribution,
    guardian(),
    program_token()
  )]
  #[case::collection_owner_ct_contract_to_collection(
    TreasuryOperation::ContractToCollection,
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_pt_contract_to_collection(
    TreasuryOperation::ContractToCollection,
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_ct_collection_to_contract(
    TreasuryOperation::CollectionToContract,
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_pt_collection_to_contract(
    TreasuryOperation::CollectionToContract,
    collection_owner(),
    program_token()
  )]
  #[case::collection_owner_ct_collection_to_distribution(
    TreasuryOperation::CollectionToDistribution,
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_ct_beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    collection_owner(),
    contract_token()
  )]
  #[case::collection_owner_ct_deposit_to_distribution(
    TreasuryOperation::DepositToDistribution,
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
      contract.assert_authorized_operation(operation, &operator, Some(&staking_program), &token_id);
    });

    assert!(panicked.is_err());
  }

  #[rstest]
  #[case::contract_to_collection_amount(
    TreasuryOperation::ContractToCollection,
    Some(5),
    (45, 55, 50, 50)
  )]
  #[case::contract_to_collection(
    TreasuryOperation::ContractToCollection,
    None,
    (0, 100, 50, 50)
  )]
  #[case::collection_to_contract_amount(
    TreasuryOperation::CollectionToContract,
    Some(5),
    (55, 45, 50, 50)
  )]
  #[case::collection_to_contract(
    TreasuryOperation::CollectionToContract,
    None,
    (100, 0, 50, 50)
  )]
  #[case::collection_to_distribution_amount(
    TreasuryOperation::CollectionToDistribution,
    Some(5),
    (50, 45, 55, 50)
  )]
  #[case::collection_to_distribution(
    TreasuryOperation::CollectionToDistribution,
    None,
    (50, 0, 100, 50)
  )]
  #[case::beneficiary_to_collection(
    TreasuryOperation::BeneficiaryToCollection,
    None,
    (50, 100, 50, 0)
  )]
  #[case::deposit_to_distribution(
    TreasuryOperation::DepositToDistribution,
    Some(5),
    (50, 50, 55, 50)
  )]
  fn test_reallocate_treasury(
    mut contract: Contract,
    mut staking_program: StakingProgram,
    contract_token: FungibleTokenID,
    #[case] operation: TreasuryOperation,
    #[case] amount: Option<u128>,
    #[case] expected: (u128, u128, u128, u128),
  ) {
    contract.reallocate_treasury(
      operation,
      Some(&mut staking_program),
      contract_token.clone(),
      amount,
    );

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
