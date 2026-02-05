import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCards from '../../components/StatCards';

describe('StatCards', () => {
  it('renders listeners and playcount', () => {
    render(<StatCards listeners={1000} playcount={2000} />);
    expect(screen.getByText(/Listeners/i)).toBeInTheDocument();
    expect(screen.getByText(/Playcount/i)).toBeInTheDocument();
  });
});
