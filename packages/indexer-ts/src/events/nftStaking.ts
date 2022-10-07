import Big from "big.js";
import { Sequelize } from "sequelize/types";
import {
  NearEvent,
  EventId,
  CREATE_STAKING_PRGRAM,
  CreateStakingProgramData,
  UPDATE_STAKING_PROGRAM,
  UpdateStakingProgramData,
} from "../types";
import { StakingProgram, StakedNft } from "../models";
import { unixTsToDate, sleep } from "../types";
import { processEventId } from ".";

export async function handleNftStakingEvent(
  event: NearEvent,
  eventId: EventId,
  sequelize: Sequelize
): Promise<void> {
  switch (event.event) {
    case CREATE_STAKING_PRGRAM: {
      let counter = 0;
      const MAX_COUNT = 3;
      async function query() {
        let data: CreateStakingProgramData = event.data[0];

        const transaction = await sequelize.transaction();

        try {
          await processEventId(eventId, transaction);
        } catch (err) {
          await transaction.rollback();
          return;
        }

        try {
          await StakingProgram.create(
            {
              collection_id: data.collection_address,
              collection_owner_id: data.collection_owner,
              token_address: data.token_address,
              min_staking_period: data.min_staking_period,
              early_withdraw_penalty: data.early_withdraw_penalty,
              round_interval: data.round_interval,
            },
            { transaction }
          );

          await transaction.commit();
        } catch {
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

    case UPDATE_STAKING_PROGRAM: {
      let counter = 0;
      const MAX_COUNT = 3;
      async function query() {
        let data: UpdateStakingProgramData = event.data[0];

        const transaction = await sequelize.transaction();

        try {
          await processEventId(eventId, transaction);
        } catch (err) {
          await transaction.rollback();
          return;
        }

        try {
          let entry: StakingProgram = (await StakingProgram.findByPk(
            data.collection_address
          ))!;

          if (data.early_withdraw_penalty)
            entry.early_withdraw_penalty = data.early_withdraw_penalty;
          if (data.min_staking_period)
            entry.min_staking_period = data.min_staking_period;

          entry.save({ transaction });

          await transaction.commit();
        } catch {
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
