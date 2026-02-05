import { describe, it, expect } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { getApp } from './setup';

describe('Artist overview', () => {
  it('returns 404 when artist not found', async () => {
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getInfo')
      .reply(200, {});
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getTopTags')
      .reply(200, { toptags: { tag: [] } });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getTopTracks')
      .reply(200, { toptracks: { track: [] } });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getSimilar')
      .reply(200, { similarartists: { artist: [] } });

    const res = await request(getApp()).get('/api/artist/Unknown/overview');
    expect(res.status).toBe(404);
  });

  it('returns normalized overview', async () => {
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getInfo')
      .reply(200, {
        artist: {
          name: 'Radiohead',
          image: [{ '#text': 'http://img', size: 'large' }],
          stats: { listeners: '1000', playcount: '2000' },
          bio: { summary: 'Bio' },
        },
      });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getTopTags')
      .reply(200, { toptags: { tag: [{ name: 'rock', count: '10' }] } });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getTopTracks')
      .reply(200, { toptracks: { track: [{ name: 'Creep', playcount: '10', listeners: '5', url: 'x', '@attr': { rank: '1' } }] } });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'artist.getSimilar')
      .reply(200, { similarartists: { artist: [] } });
    nock('https://ws.audioscrobbler.com')
      .get('/2.0/')
      .query((q) => q.method === 'track.getInfo')
      .reply(200, { track: { duration: '180000' } });

    const res = await request(getApp()).get('/api/artist/Radiohead/overview');
    expect(res.status).toBe(200);
    expect(res.body.artist.name).toBe('Radiohead');
    expect(typeof res.body.artist.stats.listeners).toBe('number');
  });
});

