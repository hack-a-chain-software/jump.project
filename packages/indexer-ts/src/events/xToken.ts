import { Sequelize, Transaction } from "sequelize/types";
import {
  NearEvent,
  PROFIT_DEPOSIT,
  ProfitDepositData,
  EventId,
} from "../types";
import { xTokenRatio } from "../models";
import { unixTsToDate, sleep } from "../types";
import { processEventId } from ".";

export async function handleXTokenEvent(
  event: NearEvent,
  eventId: EventId,
  sequelize: Sequelize
): Promise<void> {
  switch (event.event) {
    case PROFIT_DEPOSIT: {
      console.log("HERE");
      let counter = 0;
      const MAX_COUNT = 3;
      async function query() {
        let data: ProfitDepositData = event.data[0];

        const transaction = await sequelize.transaction();

        try {
          await processEventId(eventId, transaction);
        } catch (err) {
          await transaction.rollback();
          return;
        }

        try {
          await xTokenRatio.create(
            {
              time_event: unixTsToDate(data.timestamp),
              base_token_amount: data.base_token_treasury_after_deposit,
              x_token_amount: data.x_token_supply_after_deposit,
            },
            { transaction }
          );

          await transaction.commit();
        } catch (err) {
          console.log(err);
          await transaction.rollback();

          if (counter < MAX_COUNT) {
            counter += 1;
            await sleep(2000, counter);
            await query();
          }
        }
      }

      await query();
      break;
    }
  }
}
