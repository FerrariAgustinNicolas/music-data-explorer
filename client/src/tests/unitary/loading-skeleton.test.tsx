import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSkeleton from '../../components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders expected number of lines', () => {
    const { container } = render(<LoadingSkeleton lines={5} />);
    const bars = container.querySelectorAll('div.h-4');
    expect(bars.length).toBe(5);
  });
});
