use crate::*;

#[derive(Serialize, Deserialize)]
struct SerializableStakingProgram {
  pub collection: NFTCollection,
  pub collection_owner: AccountId,
  pub collection_treasury: FungibleTokenBalance,
  pub token_address: AccountId,

  pub farm: Farm,
  pub min_staking_period: U64,
  pub early_withdraw_penalty: U128,
}

#[derive(Serialize, Deserialize)]
struct SerializableFarm {
  pub round_interval: u32,
  pub start_at: u32,
  pub distributions: HashMap<FungibleTokenID, RewardsDistribution>,
}

#[near_bindgen]
impl Contract {

    //retornar o staking program / farm -> round_rewards e saldo pra ver quanto tempo vai durar a farm
    pub fn view_staking_program(&self, collection: NFTCollection) -> Option<SerializableStakingProgram> {
      match self.staking_programs.get(&collection) {
        None => None,
        Some(staking_program) => {
          let serializable_farm = SerializableFarm {
            round_interval: staking_program.farm.round_interval,
            start_at: staking_program.farm.start_at,
            distributions
          } 
        }
      };
    }


    //retornar o saldo de um nft (quanto acumulou de rewards)

    //retornar saldos do contract treasury

    //retornar guardians paginado

    pub fn view_staked(
        &self,
        collection: NFTCollection,
        account_id: Option<AccountId>,
      ) -> Vec<String> {
        let staking_program = self.staking_programs.get(&collection).unwrap();
    
        match account_id {
          None => staking_program
            .staked_nfts
            .iter()
            .map(|((_, id), _)| id)
            .collect(),
    
          Some(owner_id) => staking_program
            .nfts_by_owner
            .get(&owner_id)
            .unwrap()
            .iter()
            .map(|(_, id)| id)
            .collect(),
        }
      }
}