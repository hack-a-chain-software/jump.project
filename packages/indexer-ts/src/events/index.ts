import { Sequelize } from "sequelize/types";
import {
  LAUNCHPAD_CONTRACT,
  NFT_STAKING_CONTRACT,
  XTOKEN_CONTRACT,
} from "../env";
import { EventId, NearEvent } from "../types";
import { handleLaunchpadEvent } from "./launchpad";

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

/*
Inside each:
    Check if is one of interested events, else discard;
    Coerce JSON to event type, if convertion fails, throw;
    Perform relevant operation.
*/
