import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchPage from '../../pages/SearchPage';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as unknown as typeof fetch);

describe('SearchPage', () => {
  it('renders search input', () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Search an artist/i)).toBeInTheDocument();
  });
});
