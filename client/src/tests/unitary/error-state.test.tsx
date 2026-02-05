import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorState from '../../components/ErrorState';

describe('ErrorState', () => {
  it('renders message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when handler provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
