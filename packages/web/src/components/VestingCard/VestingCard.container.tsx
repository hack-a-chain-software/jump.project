import { differenceInMilliseconds, addMilliseconds } from "date-fns";
import { BoxProps } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { getUTCDate } from "@near/ts";
import {
  useVestingStore,
  Vesting,
  Token,
  ContractData,
} from "@/stores/vesting-store";

import { JUMP_TOKEN } from "@/env/contract";
import { useWalletSelector } from "@/context/wallet-selector";
import { useTokenBalance } from "@/hooks/modules/token";
import Big from "big.js";
import { formatBigNumberWithDecimals } from "@/tools";
import VestingCardComponent from "@/components/VestingCard/VestingCard.component";

export type VestingCardProps = Vesting &
  BoxProps & {
    token: Token;
    contractData: ContractData;
  };

function VestingCard(props: VestingCardProps) {
  const createdAt = useMemo(() => {
    return getUTCDate(Number(props.start_timestamp) / 1000000);
  }, [props.start_timestamp]);

  const endAt = useMemo(() => {
    return addMilliseconds(createdAt, Number(props.vesting_duration) / 1000000);
  }, [props.start_timestamp, props.vesting_duration]);

  const progress = useMemo(() => {
    const today = new Date();
    const base = differenceInMilliseconds(endAt, createdAt);
    const current = differenceInMilliseconds(today, createdAt) * 100;

    return Math.round(current / base);
  }, [props.start_timestamp, props.vesting_duration]);

  const { accountId, selector } = useWalletSelector();

  const { withdraw } = useVestingStore();

  const [showFastPass, setShowFastPass] = useState(false);

  const { data: baseTokenBalance } = useTokenBalance(JUMP_TOKEN, accountId);

  const decimals = useMemo(() => {
    return new Big(10).pow(props?.token?.decimals || 1);
  }, [props]);

  const totalAmount = useMemo(() => {
    return formatBigNumberWithDecimals(props.locked_value, decimals);
  }, [props, decimals]);

  const avaialbleToClaim = useMemo(() => {
    return formatBigNumberWithDecimals(props.available_to_withdraw, decimals);
  }, [props, decimals]);

  const withdrawnAmount = useMemo(() => {
    return formatBigNumberWithDecimals(props.withdrawn_tokens, decimals);
  }, [props, decimals]);

  const VestingCardComponentProps = {
    containerProps: props,
    accountId,
    endAt,
    progress,
    selector,
    withdraw,
    showFastPass,
    setShowFastPass,
    baseTokenBalance,
    totalAmount,
    avaialbleToClaim,
    withdrawnAmount,
  };

  return <VestingCardComponent {...VestingCardComponentProps} />;
}

export default VestingCard;
