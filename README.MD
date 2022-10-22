# JUMP DeFi

This monorepo encompasses all the components of the JUMP DeFi dApp.

The repo is divided in 2 main parts:
1. packages -> contains all the services for the application, each in a folder. Smart contracts and their tests are all located in packages/contracts;
2. services -> contains all container setups to run the application locally and in production

## Running the app locally

1. Install Rust and Node;
2. Install Docker and allow use without sudo;
3. Install all dependencies:
```
yarn
```
4. If there are no contract instances initilized in the testnet, run the app locally with:
```
yarn local:full
```
This might take around 30 min to initialize because of the creation of multiple accounts on testnet;
5. After the first time (4) is run, you can fastly initialize the local app with:
```
yarn local:full
```

**You can reutilize accounts deployed by other users by inserting an account_map.json file in packages/contracts/testnet_settings.
