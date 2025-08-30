import { render, screen } from '@testing-library/react';
import { ChangeIndicator, MultiPeriodChange } from '../ChangeIndicator';

describe('ChangeIndicator', () => {
  it('renders positive change correctly', () => {
    render(
      <ChangeIndicator
        value={100}
        percent={5.5}
        period="24h"
      />
    );

    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('+5.50%')).toBeInTheDocument();
    expect(screen.getByText('(+$100.00)')).toBeInTheDocument();
  });

  it('renders negative change correctly', () => {
    render(
      <ChangeIndicator
        value={-50}
        percent={-2.25}
        period="7d"
      />
    );

    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('-2.25%')).toBeInTheDocument();
    expect(screen.getByText('(-$50.00)')).toBeInTheDocument();
  });

  it('renders neutral change correctly', () => {
    render(
      <ChangeIndicator
        value={0}
        percent={0}
        period="30d"
      />
    );

    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('0.00%')).toBeInTheDocument();
    expect(screen.getByText('($0.00)')).toBeInTheDocument();
  });

  it('hides value when showValue is false', () => {
    render(
      <ChangeIndicator
        value={100}
        percent={5}
        period="24h"
        showValue={false}
      />
    );

    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('+5.00%')).toBeInTheDocument();
    expect(screen.queryByText('(+$100.00)')).not.toBeInTheDocument();
  });

  it('applies correct color classes for positive change', () => {
    const { container } = render(
      <ChangeIndicator
        value={100}
        percent={5}
        period="24h"
      />
    );

    const changeContainer = container.querySelector('.text-green-600');
    expect(changeContainer).toBeInTheDocument();
  });

  it('applies correct color classes for negative change', () => {
    const { container } = render(
      <ChangeIndicator
        value={-100}
        percent={-5}
        period="24h"
      />
    );

    const changeContainer = container.querySelector('.text-red-600');
    expect(changeContainer).toBeInTheDocument();
  });

  it('applies correct color classes for neutral change', () => {
    const { container } = render(
      <ChangeIndicator
        value={0}
        percent={0}
        period="24h"
      />
    );

    const changeContainer = container.querySelector('.text-muted-foreground');
    expect(changeContainer).toBeInTheDocument();
  });
});

describe('MultiPeriodChange', () => {
  it('renders all three period changes', () => {
    render(
      <MultiPeriodChange
        change24h={100}
        changePercent24h={5}
        change7d={-200}
        changePercent7d={-10}
        change30d={500}
        changePercent30d={25}
      />
    );

    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('+5.00%')).toBeInTheDocument();

    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('-10.00%')).toBeInTheDocument();

    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('+25.00%')).toBeInTheDocument();
  });

  it('shows values when showValues is true', () => {
    render(
      <MultiPeriodChange
        change24h={100}
        changePercent24h={5}
        change7d={-200}
        changePercent7d={-10}
        change30d={500}
        changePercent30d={25}
        showValues={true}
      />
    );

    expect(screen.getByText('(+$100.00)')).toBeInTheDocument();
    expect(screen.getByText('(-$200.00)')).toBeInTheDocument();
    expect(screen.getByText('(+$500.00)')).toBeInTheDocument();
  });

  it('handles default values correctly', () => {
    render(<MultiPeriodChange />);

    // Should render with all zeros
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    
    // All should show 0.00%
    const zeroPercents = screen.getAllByText('0.00%');
    expect(zeroPercents).toHaveLength(3);
  });
});