export type NearEvent = {
  standard: string;
  version: string;
  event: string;
  data: any[];
};

export type EventId = {
  blockHeight: number;
  index: number;
};
