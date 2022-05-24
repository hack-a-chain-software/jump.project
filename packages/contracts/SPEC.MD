## Variables:

- Owner = The owner of the contract that can update any of the global variables
- Token Address = The Token standard for that application NEP-141 or NEP-148, this is the token address that will be accepted for this contract
- Yield Per Period = The amount of yield that will be given over a specific amount of time (u128)
- Period Duration = How much time to generate each yield per period (u128)
- Last Updated Time = Last time that someone interacted with the contract (u128)
- Last Updated RPS = Last calculated Revenue Per Seed (u128)
- Users = LookupMap that will have all the users informations for the staking:
  - Balance = The amount of staked tokens for that user (u128)
  - User RPS = The last calculated revenue per seed for that user (u128)
  - Unclaimed Rewards = Rewards waiting to be Claimed

## Functions:

- (Private) Update User RPS:
  - When will be called: Every time that a specific user stakes, un-stakes and claim tokens from his account
  - Updates unclaimed rewards using this math equation:
    ```jsx
    user.unclaimed_rewards +=
      user.balance * (contract.last_updated_rps - user.user_rps);
    ```
  - Updates the User RPS with the following math equation:
    ```jsx
    user.user_rps = contract.last_updated_rps;
    ```
- (Public) Update Contract RPS :
  - When will be called: Every time that a user stakes and un-stakes tokens
  - Will update the LastUpdatedTime with the current block timestamp
  - And set the new RPS using the following Math equation
    ```jsx
    ((contract.timestamp - contract.last_updated_time) /
      contract.period_duration) *
      contract.yield_per_period;
    ```
- (Public) FT on Transfer (Staking Function):
  - Parameters: [https://nomicon.io/Standards/Tokens/FungibleToken/Core](https://nomicon.io/Standards/Tokens/FungibleToken/Core)
    - Sender ID (string)
    - Amount (string)
    - Msg (string)
  - Initialize user storage
  - Take the user tokens and add to his balance
  - Call Update Contract RPS
  - Call Update User RPS
- (Public) Claim Rewards:
  - Call Update Contract RPS
  - Call Update User RPS
  - Take user unclaimed rewards and send to the address
  - Update his Unclaimed Rewards to 03
- (Public) Unstake:
  - Paramenters:
    - Amount
  - Call Claim Rewards (Will update RPS and send the tokens to the user's wallet, and send the X Amount of tokens that he wants to Unstake)
  - Transfer the amount of tokens that he wants

## NOTES:

- contract.something = self on rust.
