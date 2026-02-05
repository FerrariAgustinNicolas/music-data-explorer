import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/EmptyState';

describe('EmptyState', () => {
  it('renders message and test id', () => {
    render(<EmptyState message="No results" />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });
});
