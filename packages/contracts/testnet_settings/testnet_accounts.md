### Main contracts

```
JUMP_TOKEN = jump_token.testnet
X_JUMP_TOKEN = jump_x_token.testnet
LAUNCHPAD = jump_launchpad.testnet
NFT_STAKING = jump_nft_staking.testnet
```

### External contracts mocked

```
USDT_TOKEN = jump_usdt.testnet
DEX_REF = jump_ref_finance.testnet
NFT_PROJECT = jump_sample_nft.testnet
```

### Owner accounts
The owner account was used to initialize all contracts.  
Therefore this account is used as source for tokens and to alter
contract owner restricted configurations.

When testing normal user functions do not use the owner account, send
a reasonable amount of tokens to a newly created user account and
perform tests there.
```
OWNER_ALL = jump_owner.testnet
```