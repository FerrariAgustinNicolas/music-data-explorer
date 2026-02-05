import { beforeAll, afterAll } from 'vitest';
import nock from 'nock';

let app: ReturnType<typeof import('../../src/app')['createApp']>;

beforeAll(async () => {
  process.env.LASTFM_API_KEY = 'test-key';
  const mod = await import('../../src/app');
  app = mod.createApp();
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

export const getApp = () => app;
