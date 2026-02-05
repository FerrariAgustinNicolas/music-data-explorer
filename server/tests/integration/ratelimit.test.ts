import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp } from './setup';

describe('Rate limit', () => {
  it('returns 429 after max requests', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 70; i += 1) {
      const res = await request(getApp()).get('/api/health');
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    expect(lastStatus).toBe(429);
  });
});

