import { useEffect, useState, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import { useVestingStore } from "@/stores/vesting-store";
import { useWalletSelector } from "@/context/wallet-selector";
import stepItemsVesting, { extraItem } from "./Vesting.tutorial";
import { formatBigNumberWithDecimals, getDecimals } from "@/tools";
import VestingComponent from "@/pages/vesting/Vesting.component";
import { addMilliseconds, isBefore } from "date-fns";
import { getUTCDate } from "@near/ts";
import Big from "big.js";

export type FilterOption = "all" | "complete" | "running" | "withdrawn";

function Vesting() {
  const [filter, setFilter] = useState<FilterOption>("all");

  const {
    accountId,
    selector,
    toggleModal: connectWallet,
  } = useWalletSelector();

  const {
    getInvestorInfo,
    getVestings,
    withdraw,
    cleanupData,
    investorInfo,
    vestings,
    loading: isLoading,
  } = useVestingStore();

  useEffect(() => {
    (async () => {
      if (!accountId) {
        await cleanupData();

        return;
      }

      await getVestings(selector, accountId);
      await getInvestorInfo(selector);
    })();
  }, [accountId]);

  const decimals = useMemo(() => {
    return getDecimals(investorInfo?.token?.decimals);
  }, [investorInfo]);

  const filtered = useMemo(() => {
    if (filter === "all") return vestings;

    return vestings.filter(
      ({
        start_timestamp,
        vesting_duration,
        locked_value,
        withdrawn_tokens,
      }) => {
        const created = getUTCDate(Number(start_timestamp) / 1000000);
        const endAt = addMilliseconds(
          created,
          Number(vesting_duration) / 1000000
        );
        const today = getUTCDate();

        switch (filter) {
          case "complete":
            return isBefore(endAt, today);
          case "running":
            return isBefore(today, endAt);
          case "withdrawn":
            return new Big(
              formatBigNumberWithDecimals(locked_value, decimals)
            ).eq(formatBigNumberWithDecimals(withdrawn_tokens, decimals));
          default:
            return true;
        }
      }
    );
  }, [filter, vestings]);

  const loading = useMemo(() => {
    if (!accountId && !isLoading) {
      return false;
    }

    return isEmpty(investorInfo);
  }, [investorInfo, accountId]);

  const totalLocked = useMemo(() => {
    return formatBigNumberWithDecimals(
      investorInfo?.totalLocked || 1,
      decimals
    );
  }, [investorInfo, decimals]);

  const totalUnlocked = useMemo(() => {
    return formatBigNumberWithDecimals(
      investorInfo?.totalUnlocked || 1,
      decimals
    );
  }, [investorInfo, decimals]);

  const totalWithdrawn = useMemo(() => {
    return formatBigNumberWithDecimals(
      investorInfo?.totalWithdrawn || 1,
      decimals
    );
  }, [investorInfo, decimals]);

  const stepItems = useMemo(() => {
    const items = stepItemsVesting;

    if (accountId! && !isEmpty(vestings)) {
      items.push(extraItem);
    }

    return items;
  }, [accountId, vestings]);

  const vestingComponentProps = {
    stepItems,
    accountId,
    selector,
    loading,
    investorInfo,
    totalLocked,
    totalUnlocked,
    totalWithdrawn,
    filter,
    setFilter,
    withdraw,
    filtered,
    connectWallet,
  };

  return <VestingComponent {...vestingComponentProps} />;
}

export default Vesting;
