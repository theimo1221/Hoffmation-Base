export interface DachsClientOptions {
  host: string;
  protocol?: 'http' | 'https';
  port?: number;
  username?: string;
  password?: string;
  resultConfig?: {
    addRawValue?: boolean;
    addKeyObject?: boolean;
    flatten?: boolean;
  };
}
