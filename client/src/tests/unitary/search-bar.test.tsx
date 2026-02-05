import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

describe('SearchBar', () => {
  it('disables button when loading', () => {
    render(
      <SearchBar
        value=""
        onChange={() => undefined}
        onSubmit={() => undefined}
        isLoading={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
