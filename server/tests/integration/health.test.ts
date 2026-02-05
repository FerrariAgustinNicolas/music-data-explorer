import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp } from './setup';

describe('API health', () => {
  it('returns ok true', async () => {
    const res = await request(getApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

