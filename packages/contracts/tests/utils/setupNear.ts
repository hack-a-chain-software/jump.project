import { connect, KeyPair } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";

/**
 * @name getNearConfig
 * @description This will get the names from the NEAR_ENV variable and apply to get the near config params
 * @param env - This is the env variable that will load the configs
 */
function getNearConfig(env: "testnet" | "sandbox") {
  switch (env) {
    case "testnet":
      return {
        networkId: "shared-test",
        nodeUrl: "https://rpc.ci-testnet.near.org",
        keyPath: `${process.env.HOME}/near/tmp/near-sandbox/validator_key.json`,
      };

    case "sandbox":
      return {
        networkId: "sandbox",
        nodeUrl: "http://localhost:3030",
        keyPath: `/tmp/near-sandbox/validator_key.json`,
      };
  }
}

/**
 * @name setupNearWithEnvironment
 * @description This function will setup the near connection using the NEAR_ENV variable
 */
export async function setupNearWithEnvironment() {
  const env: ("testnet" | "sandbox") | undefined = process.env.NEAR_ENV as
    | ("testnet" | "sandbox")
    | undefined;

  if (!env) {
    console.error(
      "Please setup the near environment on using the NEAR_ENV variable"
    );
    process.exit(1);
  }

  const configPayload = {
    ...getNearConfig(env),
  };

  const keyStore = new InMemoryKeyStore();

  if (env === "sandbox") {
    // Create near account
    const keyFile = require(getNearConfig(env).keyPath);
    const masterKey = KeyPair.fromString(keyFile.secret_key);
    keyStore.setKey(configPayload.networkId, "test.near", masterKey);
  }

  const config = {
    keyStore,
    ...getNearConfig(env),
  } as any;

  const near = await connect(config);

  return {
    near,
    config,
  };
}
