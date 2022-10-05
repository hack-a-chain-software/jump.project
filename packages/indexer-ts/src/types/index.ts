export * from "./launchpad";

export type EventId = {
  blockHeight: number;
  index: number;
};

export type NearEvent = {
  standard: string;
  version: string;
  event: string;
  data: any[];
};
