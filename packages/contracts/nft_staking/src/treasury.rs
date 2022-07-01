use crate::staking::StakingProgram;
use crate::types::*;
use crate::Contract;

pub enum Operation {
  ContractToCollection,
  CollectionToContract,
}

impl StakingProgram {
  fn only_non_program_tokens(&self, token_id: &FungibleTokenID) {
    assert_ne!(
      &self.token_address, token_id,
      "Cannot operate on staking program tokens."
    );
  }
}

impl Contract {
  pub fn realocate_treasury(
    &mut self,
    collection: &NFTCollection,
    token_id: &FungibleTokenID,
    operation: Operation,
    amount: u128,
  ) {
    let mut contract_treasury = self.contract_treasury.get(&token_id).unwrap_or(0);

    let mut staking_program = self.staking_programs.get(&collection).unwrap();
    staking_program.only_non_program_tokens(&token_id); // TODO: maybe refactor where this assertion is made. Otherwise, test it.

    let mut collection_treasury = staking_program
      .collection_treasury
      .get(&token_id)
      .unwrap_or(0);

    match operation {
      Operation::CollectionToContract => {
        assert!(
          amount <= collection_treasury,
          "Insufficient collection treasury"
        );
        collection_treasury -= amount;
        contract_treasury += amount;
      }
      Operation::ContractToCollection => {
        assert!(
          amount <= contract_treasury,
          "Insufficient contract treasury"
        );
        contract_treasury -= amount;
        collection_treasury += amount;
      }
    }

    staking_program
      .collection_treasury
      .insert(&token_id, &collection_treasury);
    self.staking_programs.insert(&collection, &staking_program);

    self.contract_treasury.insert(&token_id, &contract_treasury);
  }
}
