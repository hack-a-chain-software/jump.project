use crate::*;

#[near_bindgen]
impl Contract {

    //retornar o staking program / farm -> round_rewards e saldo pra ver quanto tempo vai durar a farm

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