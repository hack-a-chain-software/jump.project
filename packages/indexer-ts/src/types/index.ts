export * from "./launchpad";

export type EventId = {
  blockHeight: string;
  transactionHash: string;
  eventIndex: string;
};

export type NearEvent = {
  standard: string;
  version: string;
  event: string;
  data: any[];
};
