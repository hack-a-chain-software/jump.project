import { useNearQuery } from "react-near";

const defaultLPOptions = {
  contract: import.meta.env.VITE_JUMP_LAUNCHPAD_CONTRACT,
  poolInterval: 1000 * 60,
  debug: true,
  onCompleted: console.log,
  onError: console.log,
};

type InvestorInfo = {
  account_id: string;
  storage_deposit: string;
  storage_used: string;
  is_listing_owner: string;
  staked_token: string;
  last_check: string;
};

export const useViewInvestor = (account_id: string) => {
  return useNearQuery<InvestorInfo>("view_investor", {
    ...defaultLPOptions,
    skip: !account_id,
    variables: {
      account_id: account_id,
    },
  });
};

export const useViewInvestorAllocation = (
  account_id: string,
  listing_id: string
) => {
  const {
    data = [],
    loading,
    error,
    refetch,
  } = useNearQuery<[string, string]>("view_investor_allocation", {
    ...defaultLPOptions,
    skip: !account_id,
    variables: {
      listing_id,
      account_id,
    },
  });

  return {
    loading,
    error,
    refetch,
    data: {
      allocationsBought: data[0] || "0",
      totalTokensBought: data[1] || "0",
    },
  };
};

export const useViewVestedAllocations = (
  account_id: string,
  listing_id: string
) => {
  return useNearQuery<string>("view_vested_allocations", {
    ...defaultLPOptions,
    skip: !account_id,
    variables: {
      listing_id,
      account_id,
    },
  });
};

export const useViewInvestorAllowance = (
  account_id: string,
  listing_id: string
) => {
  return useNearQuery<string>("view_investor_allowance", {
    ...defaultLPOptions,
    skip: !account_id,
    variables: {
      listing_id,
      account_id,
    },
  });
};

export const useViewTotalEstimatedInvestorAllowance = (account_id: string) => {
  return useNearQuery<string>("view_investor_allowance", {
    ...defaultLPOptions,
    skip: !account_id,
    variables: {
      account_id,
    },
  });
};
