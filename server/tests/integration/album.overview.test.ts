import { describe, it, expect } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { getApp } from './setup';

describe('Album overview', () => {
  it('returns album info', async () => {
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .reply(200, {
        album: {
          name: 'OK Computer',
          artist: 'Radiohead',
          image: [{ '#text': 'http://img', size: 'large' }],
          playcount: '500',
          listeners: '200',
          tags: { tag: [] },
          tracks: { track: [] },
        },
      });

    const res = await request(getApp()).get('/api/album/overview?artist=Radiohead&album=OK%20Computer');
    expect(res.status).toBe(200);
    expect(res.body.album.name).toBe('OK Computer');
    expect(typeof res.body.album.stats.playcount).toBe('number');
    expect(typeof res.body.album.stats.listeners).toBe('number');
  });
});

describe('Album overview validation', () => {
  it('returns 400 when missing params', async () => {
    const res = await request(getApp()).get('/api/album/overview');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});

