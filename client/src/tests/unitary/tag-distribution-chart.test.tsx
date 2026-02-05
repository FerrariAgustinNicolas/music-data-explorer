import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import TagDistributionChart from '../../components/TagDistributionChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Tooltip: () => <div />,
}));

describe('TagDistributionChart', () => {
  it('renders title and footer text', () => {
    render(
      <TagDistributionChart
        tags={[
          { name: 'rock', count: 10, percent: 60 },
          { name: 'alternative', count: 5, percent: 30 },
        ]}
      />
    );

    expect(screen.getByText('Tag / genre distribution')).toBeInTheDocument();
    expect(screen.getByText(/Top tags by relative count/i)).toBeInTheDocument();
  });
});
