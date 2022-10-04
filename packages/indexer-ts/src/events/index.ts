import {
  LAUNCHPAD_CONTRACT,
  NFT_STAKING_CONTRACT,
  XTOKEN_CONTRACT,
} from "../env";
import { EventId, NearEvent } from "../types";

export async function processEvent(
  executorId: string,
  eventJsonString: string,
  eventId: EventId
): Promise<void> {
  const event: NearEvent = JSON.parse(eventJsonString);
  switch (executorId) {
    case LAUNCHPAD_CONTRACT: {
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
