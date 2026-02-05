import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { getApp } from './setup';

beforeEach(() => {
  nock.cleanAll();
});

describe('Artist search', () => {
  it('validates missing query', async () => {
    const res = await request(getApp()).get('/api/search/artist');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns normalized results', async () => {
    const query = 'Radiohead-Normalized';
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .reply(200, {
        results: {
          artistmatches: {
            artist: [
              {
                name: 'Radiohead',
                mbid: '1',
                url: 'https://last.fm/music/Radiohead',
                image: [{ '#text': 'http://img', size: 'large' }],
                listeners: '1234',
                streamable: '0',
              },
            ],
          },
        },
      });

    const res = await request(getApp()).get(`/api/search/artist?q=${encodeURIComponent(query)}`);
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Radiohead');
    expect(typeof res.body[0].listeners).toBe('number');
  });

  it('returns 400 when query is only whitespace', async () => {
    const res = await request(getApp()).get('/api/search/artist?q=%20%20%20');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 500 when upstream fails', async () => {
    const query = 'Radiohead-Fail';
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    nock.cleanAll();
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .reply(500, {});

    try {
      const res = await request(getApp()).get(`/api/search/artist?q=${encodeURIComponent(query)}`);
      expect(res.status).toBe(500);
      expect(res.body.error?.code).toBe('INTERNAL_ERROR');
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('returns 500 when upstream network error', async () => {
    const query = 'Radiohead-NetworkFail';
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    nock.cleanAll();
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .replyWithError('Network error');

    try {
      const res = await request(getApp()).get(`/api/search/artist?q=${encodeURIComponent(query)}`);
      expect(res.status).toBe(500);
      expect(res.body.error?.code).toBe('INTERNAL_ERROR');
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('uses cache for repeated queries', async () => {
    const query = 'Radiohead-Cache';
    nock.cleanAll();
    const scope = nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .once()
      .reply(200, {
        results: {
          artistmatches: {
            artist: [
              {
                name: 'Radiohead',
                mbid: '1',
                url: 'https://last.fm/music/Radiohead',
                image: [{ '#text': 'http://img', size: 'large' }],
                listeners: '1234',
                streamable: '0',
              },
            ],
          },
        },
      });

    const first = await request(getApp()).get(`/api/search/artist?q=${encodeURIComponent(query)}`);
    expect(first.status).toBe(200);
    const second = await request(getApp()).get(`/api/search/artist?q=${encodeURIComponent(query)}`);
    expect(second.status).toBe(200);
    expect(scope.isDone()).toBe(true);
  });
});

