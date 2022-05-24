export type WithNearParams<Params = any> = {
  params?: Params;
  gas?: string;
  amount?: string;
};

export type Option<T> = T | null;
