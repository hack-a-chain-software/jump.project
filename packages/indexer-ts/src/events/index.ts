import { Transaction } from "sequelize";
import { Sequelize } from "sequelize/types";
import {
  LAUNCHPAD_CONTRACT,
  NFT_STAKING_CONTRACT,
  XTOKEN_CONTRACT,
} from "../env";
import { EventId, NearEvent } from "../types";
import { handleLaunchpadEvent } from "./launchpad";
import { ProcessedEvent } from "../models";

export async function processEvent(
  executorId: string,
  eventJsonString: string,
  eventId: EventId,
  sequelize: Sequelize
): Promise<void> {
  const event: NearEvent = JSON.parse(eventJsonString);
  switch (executorId) {
    case LAUNCHPAD_CONTRACT: {
      await handleLaunchpadEvent(event, eventId, sequelize);
      break;
    }
    case NFT_STAKING_CONTRACT: {
      break;
    }
    case XTOKEN_CONTRACT: {
      break;
    }
  }
}

/* Method to insert evetnIds into table
 * must be called on every event write to DB
 */
export async function processEventId(
  eventId: EventId,
  transaction: Transaction
) {
  await ProcessedEvent.create(
    {
      block_height: eventId.blockHeight,
      transaction_hash: eventId.transactionHash,
      event_index: eventId.eventIndex,
    },
    { transaction }
  );
}
