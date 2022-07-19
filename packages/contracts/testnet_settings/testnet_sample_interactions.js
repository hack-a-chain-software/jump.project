// import * as nearAPI from "near-api-js";
// import { homedir } from "os";
// import { join } from "path";
// import { BN } from "near-workspaces";

const nearAPI = require("near-api-js");
const { homedir } = require("os");
const { join } = require("path");
const { BN } = require("near-workspaces");

const {
  connect,
  Contract,
  keyStores,
  utils: {
    format: { parseNearAmount },
  },
} = nearAPI;

// enum ListingType {
//     Public = "public",
//     Private = "private",
// }

// type ListingData = {
//     project_owner,
//     project_token,
//     price_token,
//     listing_type: ListingType,
//     open_sale_1_timestamp_seconds,
//     open_sale_2_timestamp_seconds,
//     final_sale_2_timestamp_seconds,
//     liquidity_pool_timestamp_seconds,
//     total_amount_sale_project_tokens,
//     token_allocation_size,
//     token_allocation_price,
//     liquidity_pool_project_tokens,
//     liquidity_pool_price_tokens,
//     fraction_instant_release,
//     fraction_cliff_release,
//     cliff_timestamp_seconds,
//     end_cliff_timestamp_seconds,
//     fee_price_tokens,
//     fee_liquidity_tokens,
// }

async function seed_testnet() {
  const credentialsPath = join(homedir(), ".near-credentials");

  const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

  const config = {
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    headers: {},
  };
  const near = await connect(config);

  const launchpad = "launchpad_ind2.testnet";
  const nftStaking = "jump_nft_staking2.testnet";
  const jumpToken = "jump_token.testnet";
  const jumpxToken = "jump_x_token.testnet";
  const acovaToken = "jump_acova_token.testnet";
  const nftToken = "jump_nft_token.testnet";
  const negentraNftContract = "negentra_base_nft.testnet";
  const nftContract = "jump_sample_nft.testnet";
  const usdtContract = "jump_usdt.testnet";

  const jumpOwner = await near.account("jump_owner.testnet");
  const jumpUser1 = await near.account("jump_user1.testnet");
  const jumpListingOwner = await near.account("jump_project_owner.testnet");

  let nowTimestamp = Math.floor(Date.now() / 1000);

  function increaseTimeStamp(nowTimestamp, monthsIncrease) {
    let newTime = nowTimestamp + monthsIncrease * 60 * 60 * 24 * 30;
    return newTime.toString();
  }

  // create launchpad listing

  const listing_data = {
    project_owner: jumpListingOwner.accountId,
    project_token: jumpToken,
    price_token: usdtContract,
    listing_type: "Public",
    open_sale_1_timestamp_seconds: (nowTimestamp + 600).toString(),
    open_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 2),
    final_sale_2_timestamp_seconds: increaseTimeStamp(nowTimestamp, 3),
    liquidity_pool_timestamp_seconds: increaseTimeStamp(nowTimestamp, 4),
    total_amount_sale_project_tokens: "1000000000",
    token_allocation_size: "1000",
    token_allocation_price: "10",
    liquidity_pool_project_tokens: "100000",
    liquidity_pool_price_tokens: "2000",
    fraction_instant_release: "10",
    fraction_cliff_release: "50",
    cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 5),
    end_cliff_timestamp_seconds: increaseTimeStamp(nowTimestamp, 6),
    fee_price_tokens: "0",
    fee_liquidity_tokens: "0",
  };

  // await jumpOwner.functionCall({
  //   contractId: launchpad,
  //   methodName: "storage_deposit",
  //   args: {
  //     account_id: jumpListingOwner.accountId,
  //     registration_only: true,
  //   },
  //   attachedDeposit: parseNearAmount("1"),
  // });

  // await jumpOwner.functionCall({
  //   contractId: launchpad,
  //   methodName: "create_new_listing",
  //   args: { listing_data },
  //   attachedDeposit: new BN(1),
  // });

  // await jumpOwner.functionCall({
  //   contractId: jumpToken,
  //   methodName: "storage_deposit",
  //   args: {
  //     account_id: launchpad,
  //     registration_only: true,
  //   },
  //   attachedDeposit: parseNearAmount("1"),
  // });
  // await jumpOwner.functionCall({
  //   contractId: jumpToken,
  //   methodName: "ft_transfer_call",
  //   args: {
  //     receiver_id: launchpad,
  //     amount: "1000100000",
  //     memo: null,
  //     msg: JSON.stringify({
  //       type: "FundListing",
  //       listing_id: "4"
  //     })
  //   },
  //   attachedDeposit: new BN(1),
  //   gas: new BN("300000000000000")
  // })

  //cancel listing
  // await jumpOwner.functionCall({
  //   contractId: launchpad,
  //   methodName: "cancel_listing",
  //   args: { listing_id: "1" },
  //   attachedDeposit: new BN(1),
  // });

  await jumpOwner.functionCall({
    contractId: jumpxToken,
    methodName: "storage_deposit",
    args: {
      account_id: jumpUser1.accountId,
      registration_only: true,
    },
    attachedDeposit: parseNearAmount("1"),
  });
  await jumpOwner.functionCall({
    contractId: jumpxToken,
    methodName: "ft_transfer",
    args: {
      receiver_id: jumpUser1.accountId,
      amount: "1000000000",
      memo: null,
    },
    attachedDeposit: new BN(1),
  });
  await jumpOwner.functionCall({
    contractId: launchpad,
    methodName: "storage_deposit",
    args: {
      account_id: jumpUser1.accountId,
      registration_only: true,
    },
    attachedDeposit: parseNearAmount("1"),
  });
  await jumpOwner.functionCall({
    contractId: jumpxToken,
    methodName: "storage_deposit",
    args: {
      account_id: launchpad,
      registration_only: true,
    },
    attachedDeposit: parseNearAmount("1"),
  });
  await jumpUser1.functionCall({
    contractId: jumpxToken,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: launchpad,
      amount: "1000000000",
      memo: null,
      msg: JSON.stringify({
        type: "VerifyAccount",
        membership_tier: "3",
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  await jumpOwner.functionCall({
    contractId: usdtContract,
    methodName: "storage_deposit",
    args: {
      account_id: jumpUser1.accountId,
      registration_only: true,
    },
    attachedDeposit: parseNearAmount("1"),
  });
  await jumpOwner.functionCall({
    contractId: usdtContract,
    methodName: "ft_transfer",
    args: {
      receiver_id: jumpUser1.accountId,
      amount: "1000000000",
      memo: null,
    },
    attachedDeposit: new BN(1),
  });
  await jumpOwner.functionCall({
    contractId: usdtContract,
    methodName: "storage_deposit",
    args: {
      account_id: launchpad,
      registration_only: true,
    },
    attachedDeposit: parseNearAmount("1"),
  });
  await jumpUser1.functionCall({
    contractId: usdtContract,
    methodName: "ft_transfer_call",
    args: {
      receiver_id: launchpad,
      amount: "10000000",
      memo: null,
      msg: JSON.stringify({
        type: "BuyAllocation",
        listing_id: "4",
      }),
    },
    attachedDeposit: new BN(1),
    gas: new BN("300000000000000"),
  });

  //create other listing

  //fund listing

  //buy shares

  // // create nft staking staking protocol
  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "add_guardian",
  //   args: { guardian: jumpOwner.accountId },
  //   attachedDeposit: new BN(1),
  // });

  // await jumpOwner.functionCall({
  //   contractId: nftToken,
  //   methodName: "storage_deposit",
  //   args: {
  //     account_id: nftStaking,
  //   },
  //   attachedDeposit: parseNearAmount("1"),
  // });
  // await jumpOwner.functionCall({
  //   contractId: acovaToken,
  //   methodName: "storage_deposit",
  //   args: {
  //     account_id: nftStaking,
  //   },
  //   attachedDeposit: parseNearAmount("1"),
  // });
  // await jumpOwner.functionCall({
  //   contractId: jumpToken,
  //   methodName: "storage_deposit",
  //   args: {
  //     account_id: nftStaking,
  //   },
  //   attachedDeposit: parseNearAmount("1"),
  // });

  // await jumpOwner.functionCall({
  //   contractId: nftToken,
  //   methodName: "ft_transfer_call",
  //   args: {
  //     receiver_id: nftStaking,
  //     amount: "1000000000000",
  //     memo: null,
  //     msg: JSON.stringify({
  //       type: "CollectionOwnerDeposit",
  //       collection: {
  //         type: "n_f_t_contract",
  //         account_id: nftContract,
  //       },
  //     }),
  //   },
  //   attachedDeposit: new BN(1),
  //   gas: new BN("300000000000000"),
  // });
  // await jumpOwner.functionCall({
  //   contractId: nftToken,
  //   methodName: "ft_transfer_call",
  //   args: {
  //     receiver_id: nftStaking,
  //     amount: "1000000000000",
  //     memo: null,
  //     msg: JSON.stringify({
  //       type: "CollectionOwnerDeposit",
  //       collection: {
  //         type: "n_f_t_contract",
  //         account_id: negentraNftContract,
  //       },
  //     }),
  //   },
  //   attachedDeposit: new BN(1),
  //   gas: new BN("300000000000000"),
  // });
  // await jumpOwner.functionCall({
  //   contractId: jumpToken,
  //   methodName: "ft_transfer_call",
  //   args: {
  //     receiver_id: nftStaking,
  //     amount: "2000000000000",
  //     memo: null,
  //     msg: JSON.stringify({ type: "OwnerDeposit" }),
  //   },
  //   attachedDeposit: new BN(1),
  //   gas: new BN("300000000000000"),
  // });

  // await jumpOwner.functionCall({
  //   contractId: acovaToken,
  //   methodName: "ft_transfer_call",
  //   args: {
  //     receiver_id: nftStaking,
  //     amount: "2000000000000",
  //     memo: null,
  //     msg: JSON.stringify({ type: "OwnerDeposit" }),
  //   },
  //   attachedDeposit: new BN(1),
  //   gas: new BN("300000000000000"),
  // });

  // const collection_rps = {};
  // collection_rps[jumpToken] = "1000";
  // collection_rps[acovaToken] = "1000";
  // collection_rps[nftToken] = "1000";
  // const createStakingPayload = {
  //   collection_address: nftContract,
  //   collection_owner: jumpListingOwner.accountId,
  //   token_address: nftToken,
  //   collection_rps,
  //   min_staking_period: "10000000000000",
  //   early_withdraw_penalty: "1000000000000",
  //   round_interval: 200,
  // };
  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "create_staking_program",
  //   args: { payload: createStakingPayload },
  //   attachedDeposit: new BN(1),
  //   gas: new BN(300000000000000),
  // });
  // const createStakingPayload2 = {
  //   collection_address: negentraNftContract,
  //   collection_owner: jumpListingOwner.accountId,
  //   token_address: negentraNftContract,
  //   collection_rps,
  //   min_staking_period: "10000000000000",
  //   early_withdraw_penalty: "1000000000000",
  //   round_interval: 200,
  // };
  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "create_staking_program",
  //   args: { payload: createStakingPayload2 },
  //   attachedDeposit: new BN(1),
  //   gas: new BN(300000000000000),
  // });

  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "move_contract_funds_to_collection",
  //   args: {
  //     collection: {
  //       type: "n_f_t_contract",
  //       account_id: nftContract,
  //     },
  //     token_id: acovaToken,
  //     amount: "1000000000000",
  //   },
  //   attachedDeposit: new BN(1),
  // });

  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "move_contract_funds_to_collection",
  //   args: {
  //     collection: {
  //       type: "n_f_t_contract",
  //       account_id: nftContract,
  //     },
  //     token_id: jumpToken,
  //     amount: "1000000000000",
  //   },
  //   attachedDeposit: new BN(1),
  // });

  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "move_contract_funds_to_collection",
  //   args: {
  //     collection: {
  //       type: "n_f_t_contract",
  //       account_id: negentraNftContract,
  //     },
  //     token_id: acovaToken,
  //     amount: "1000000000000",
  //   },
  //   attachedDeposit: new BN(1),
  // });
  // await jumpOwner.functionCall({
  //   contractId: nftStaking,
  //   methodName: "move_contract_funds_to_collection",
  //   args: {
  //     collection: {
  //       type: "n_f_t_contract",
  //       account_id: negentraNftContract,
  //     },
  //     token_id: jumpToken,
  //     amount: "1000000000000",
  //   },
  //   attachedDeposit: new BN(1),
  // });
}

seed_testnet();
