use near_sdk::AccountId;

use crate::{
  types::{FungibleTokenID, NFTCollection},
  Contract,
};

pub enum DepositOperation {
  ContractTreasury {
    token_id: FungibleTokenID,
    amount: u128,
  },
  CollectionTreasury {
    collection: NFTCollection,
    token_id: FungibleTokenID,
    amount: u128,
  },
}

impl Contract {
  fn assert_authorized_deposit_operation(
    &self,
    operation: &DepositOperation,
    operator: &AccountId,
  ) {
    match operation {
      DepositOperation::ContractTreasury {
        token_id,
        amount: _,
      } => {
        /*
         *   TODO: this operation is unauthorized because we want partners to call it,
         * if we ever create more authorization roles, we should assert it here.
         */
        self.only_contract_tokens(token_id);
      }
      DepositOperation::CollectionTreasury {
        collection,
        token_id,
        amount: _,
      } => {
        // TODO: ideally this repeated read wouldn't be needed if we had a global program token index
        let staking_program = self.staking_programs.get(&collection).unwrap();
        self.assert_authorized_operator(operator, &staking_program, token_id);
      }
    }
  }

  fn deposit_treasury(&mut self, operation: DepositOperation) {
    match operation {
      DepositOperation::ContractTreasury { token_id, amount } => {
        *self.contract_treasury.entry(token_id).or_insert(0) += amount;
      }
      DepositOperation::CollectionTreasury {
        collection,
        token_id,
        amount,
      } => {
        let mut staking_program = self.staking_programs.get(&collection).unwrap();

        *staking_program
          .collection_treasury
          .entry(token_id)
          .or_insert(0) += amount;

        self
          .staking_programs
          .insert(&staking_program.collection, &staking_program);
      }
    }
  }

  pub fn deposit(&mut self, operation: DepositOperation, operator: &AccountId) {
    self.assert_authorized_deposit_operation(&operation, operator);
    self.deposit_treasury(operation);
  }
}

#[cfg(test)]
mod tests {
  use rstest::rstest;

  use super::super::tests_fixtures::*;
  use super::*;

  #[rstest]
  #[case::contract_guardian_ct(
    DepositOperation::ContractTreasury{
      token_id: contract_token(),
      amount: 0,
    },
    guardian()
  )]
  #[case::collection_guardian_ct(
    DepositOperation::CollectionTreasury {
      collection: collection(),
      token_id: contract_token(),
      amount: 0,
    },
    guardian()
  )]
  #[case::collection_collection_owner_pt(
    DepositOperation::CollectionTreasury {
      collection: collection(),
      token_id: program_token(),
      amount: 0,
    },
    collection_owner()
  )]
  fn test_authorized_deposit(
    contract: Contract,
    #[case] operation: DepositOperation,
    #[case] operator: AccountId,
  ) {
    contract.assert_authorized_deposit_operation(&operation, &operator);
  }

  #[rstest]
  #[case::contract_guardian_pt(
    DepositOperation::ContractTreasury{
      token_id: program_token(),
      amount: 0,
    },
    guardian()
  )]
  #[case::contract_collection_owner_pt(
    DepositOperation::ContractTreasury{
      token_id: program_token(),
      amount: 0,
    },
    collection_owner()
  )]
  #[case::collection_guardian_pt(
    DepositOperation::CollectionTreasury {
      collection: collection(),
      token_id: program_token(),
      amount: 0,
    },
    guardian()
  )]
  #[case::collection_collection_owner_ct(
    DepositOperation::CollectionTreasury {
      collection: collection(),
      token_id: contract_token(),
      amount: 0,
    },
    collection_owner()
  )]
  fn test_unauthorized_deposit(
    contract: Contract,
    #[case] operation: DepositOperation,
    #[case] operator: AccountId,
  ) {
    std::panic::set_hook(Box::new(|_| {}));

    let panicked = std::panic::catch_unwind(|| {
      contract.assert_authorized_deposit_operation(&operation, &operator);
    });

    assert!(panicked.is_err());
  }

  #[rstest]
  fn test_deposit_contract_treasury(mut contract: Contract, contract_token: FungibleTokenID) {
    let initial_balance = *contract.contract_treasury.get(&contract_token).unwrap();

    let amount = 1;

    contract.deposit_treasury(DepositOperation::ContractTreasury {
      token_id: contract_token.clone(),
      amount,
    });

    let final_balance = *contract.contract_treasury.get(&contract_token).unwrap();

    assert_eq!(initial_balance + amount, final_balance);
  }

  #[rstest]
  fn test_deposit_collection_treasury(
    mut contract: Contract,
    collection: NFTCollection,
    contract_token: FungibleTokenID,
  ) {
    let initial_balance = *contract
      .staking_programs
      .get(&collection)
      .unwrap()
      .collection_treasury
      .get(&contract_token)
      .unwrap();

    let amount = 1;

    contract.deposit_treasury(DepositOperation::CollectionTreasury {
      collection: collection.clone(),
      token_id: contract_token.clone(),
      amount,
    });

    let final_balance = *contract
      .staking_programs
      .get(&collection)
      .unwrap()
      .collection_treasury
      .get(&contract_token)
      .unwrap();

    assert_eq!(initial_balance + amount, final_balance);
  }
}
