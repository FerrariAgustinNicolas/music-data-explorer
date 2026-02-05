import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArtistSearchResults from '../../components/ArtistSearchResults';

const results = [
  {
    name: 'Radiohead',
    mbid: '1',
    url: 'https://last.fm/music/Radiohead',
    image: null,
    listeners: 1000,
  },
];

describe('ArtistSearchResults', () => {
  it('renders placeholder when image missing', () => {
    render(
      <ArtistSearchResults
        results={results}
        mode="artist"
        onSelectArtist={() => undefined}
      />
    );

    expect(screen.getByText('Artist')).toBeInTheDocument();
  });
});
