import { describe, it, expect } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { getApp } from './setup';

describe('Album search', () => {
  it('validates missing query', async () => {
    const res = await request(getApp()).get('/api/search/album');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns normalized album results', async () => {
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query(true)
      .reply(200, {
        results: {
          albummatches: {
            album: [
              {
                name: 'OK Computer',
                artist: 'Radiohead',
                mbid: '2',
                url: 'https://last.fm/music/Radiohead/OK+Computer',
                image: [{ '#text': 'http://img', size: 'large' }],
                playcount: '5000',
              },
            ],
          },
        },
      });

    const res = await request(getApp()).get('/api/search/album?q=OK%20Computer');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('OK Computer');
    expect(typeof res.body[0].playcount).toBe('number');
  });
});

