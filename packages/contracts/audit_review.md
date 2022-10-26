# Auxiliary contracts audit review

This document comments on the audit report from BlockApex, discussing every issue, identifed bugs, proposed changes and fixes implemented in the code.

This document refers to audit on commit hash ddb92dda6eb779ac854471eeda817abeacfc054e

## 3. Inadequate implementation leads to loss of rewards (xJUMP)
### Acknowledged

The issue is acknowledged, however the staking contract will be discontinued as the team opted to go along only with the xJUMP model for token staking.

The staking contract has been excluded from the repository.

## 4. Insufficient Access Controls on NFT Minting (nft_contract)
### Acknowledged

Issue refers to testnet only contract, no need to implement

## 5. Users will not be able to withdraw their locked tokens even after they are unlocked (locked_token)
### Implemented

The auditors point out that there is an insufficient gas amount being passed to cross contract calls. The contract has been updated to pass 120 Tgas to `ft_tranfer` and 50 Tgas to the attached callback.


## 12. Inadequate function parameters (vesting_contract)

## 15. Inadequate validation on AccountId (mintable token)

## 18. Optimization in withdraw (locked_token)

