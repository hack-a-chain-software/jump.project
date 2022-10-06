export * from "./launchpad";

export type EventId = {
  blockHeight: number;
  transactionHash: string;
  eventIndex: number;
};

export type NearEvent = {
  standard: string;
  version: string;
  event: string;
  data: any[];
};
