const { Client } = require("pg");
const {
  nftsArray,
  tokenArray,
  parseAccountName,
} = require("../../packages/contracts/testnet_settings/cd_setup/setup");

restartDb();

async function restartDb() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: 5432,
  });

  const initiliazeTestnetQuery = "";

  for (token of tokenArray) {
    const baseLaunchpadQuery = `
    INSERT INTO listings_metadata (
        listing_id,
        project_name,
        description_token,
        description_project,
        discord,
        twitter,
        telegram,
        website,
        whitepaper
      )
    VALUES (
        ${builQueryString(token.db_metadata.listing_id)},
        ${builQueryString(token.db_metadata.project_name)},
        ${builQueryString(token.db_metadata.description_token)},
        ${builQueryString(token.db_metadata.description_project)},
        ${builQueryString(token.db_metadata.discord)},
        ${builQueryString(token.db_metadata.twitter)},
        ${builQueryString(token.db_metadata.telegram)},
        ${builQueryString(token.db_metadata.website)},
        ${builQueryString(token.db_metadata.whitepaper)},
      );
    `;
    setupQuery += baseLaunchpadQuery;
  }

  for (collection of nftsArray) {
    const baseNftQuery = `
    INSERT INTO staking_programs_metadata (
        collection_id,
        collection_image,
        collection_modal_image
      )
    VALUES (
        '${parseAccountName(collection.nft.name)}',
        ${builQueryString(collection.db_metadata.collection_image)},
        ${builQueryString(collection.db_metadata.collection_modal_image)}
      );
    `;
    setupQuery += baseNftQuery;
  }

  await client.query(initiliazeTestnetQuery);
  console.log("Initial data succesfully seeded");

  process.exit(0);
}

function builQueryString(input) {
  if (input === null) {
    return "NULL";
  } else {
    return "'" + input + "'";
  }
}
