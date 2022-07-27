<<<<<<< HEAD
### Owner accounts
The owner account was used to initialize all contracts.  
Therefore this account is used as source for tokens and to alter
contract owner restricted configurations.
=======
# Set testnet application

To setup the entire application suite in testnet, run the testnet_sample_interactions.js script.  
The script will create a suite of accounts in testnet, whose addresses can be seen at account_map.json file.  
The credentials for the created accounts will be stored in .near-credentials in this directory.

### Initialized contracts

"ownerAccount":  account with owner priviledges in all contract
"userSampleAccount": sample account to interact as an user with the applications
"jumpTokenAccount": NEP-141 token - project native token
"auroraTokenAccount": NEP-141 token - token to use in launchpad and nft staking rewards
"octopusTokenAccount": NEP-141 token - token to use in launchpad and nft staking rewards
"skywardTokenAccount": NEP-141 token - token to use in launchpad and nft staking rewards
"usdtTokenAccount": NEP-141 token - supposed to mock stable coin used to raise funds in launchpad
"xTokenAccount": x_jump token contract
"lockedTokenAccount": locked_jump token contract
"nftCollection1Account": NEP-171 sample collection to use in nft staking contract
"nftCollection2Account": NEP-171 sample collection to use in nft staking contract
"nftCollection3Account": "NEP-171 sample collection to use in nft staking contract
"nftStaking": nft staking application
"launchpad": launchpad application

### Testing applications
>>>>>>> main

To test nft staking functionalities, it is necessary to first mint NFTs in the sample contracts using the mint call:
```
near call <nft_contract_address> nft_mint --accountId <your_testnet_account> --deposit 1 
```
This will mint a random nft from the collection that you can then stake in the contract.


To test launchpad functionality, you'll need:
1. Send the price token from ownerAccount to your test account using the following calls
```
near call <price_token_address - usdtTokenAccount> storage_deposit '{"account_id": null, "registration_only": true}' --accountId <your_testnet_account> --deposit 1 
```
```
near call <price_token_address - usdtTokenAccount> ft_transfer '{"receiver_id": "<your_account>", "amount": "<transfer_amount>", "memo": null}' --accountId <ownerAccount> --depositYocto 1 
```
2. If the listing you want to invest on is private, you'll also need to add your account to the whitelist:
```
near call <launchpad_address> add_investor_private_sale_whitelist '{"listing_id": "<listing_id>", "account_id": "<your_account>", "allocations": <quantity of allocations you wish to allow user to buy>}' --accountId <ownerAccount> --depositYocto 1
```
*** Other setups like staking x_tokens to earn allocations should be performed on the front end directly and do not need to be set up priorly