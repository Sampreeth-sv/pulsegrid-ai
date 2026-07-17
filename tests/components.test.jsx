import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zap } from 'lucide-react';
import {
  AnimatedNumber,
  PulsingDot,
  StatCard,
  SectionHeader,
  Badge,
  Panel,
  ProgressBar,
  EmptyState,
  AIThinking
} from '../src/components/ui';

describe('UI Shared Components Tests', () => {
  it('renders AnimatedNumber with prefix and suffix', () => {
    render(<AnimatedNumber value={100} prefix="$" suffix=" USD" />);
    const element = screen.getByText(/100/);
    expect(element).toBeDefined();
  });

  it('renders PulsingDot with correct colors', () => {
    const { container } = render(<PulsingDot color="bg-accent" size="w-3 h-3" />);
    // Select by the specific size class to get the inner dot
    const dot = container.querySelector('.w-3');
    expect(dot).not.toBeNull();
    expect(dot.classList.contains('bg-accent')).toBe(true);
  });

  it('renders StatCard correctly with values and trends', () => {
    render(
      <StatCard
        title="Revenue Impact"
        value={1500}
        sub="Estimated loss"
        icon={Zap}
        trend="up"
        trendValue="12.5%"
      />
    );
    expect(screen.getByText('Revenue Impact')).toBeDefined();
    expect(screen.getByText('Estimated loss')).toBeDefined();
    expect(screen.getByText('12.5%')).toBeDefined();
  });

  it('renders SectionHeader with title, subtitle, and live badge', () => {
    render(
      <SectionHeader
        icon={Zap}
        title="Telemetry Center"
        subtitle="Live metrics feed"
        live={true}
      />
    );
    expect(screen.getByText('Telemetry Center')).toBeDefined();
    expect(screen.getByText('Live metrics feed')).toBeDefined();
    expect(screen.getByText('LIVE')).toBeDefined();
  });

  it('renders Badge with custom variants', () => {
    render(<Badge variant="CRITICAL">Outage</Badge>);
    const badge = screen.getByText('Outage');
    expect(badge).toBeDefined();
    expect(badge.classList.contains('text-danger')).toBe(true);
  });

  it('renders Panel with title and content children', () => {
    render(
      <Panel title="Config Control" accentColor="#00E5A8">
        <p>Inside panel</p>
      </Panel>
    );
    expect(screen.getByText('Config Control')).toBeDefined();
    expect(screen.getByText('Inside panel')).toBeDefined();
  });

  it('renders ProgressBar with correct percent value and labels', () => {
    render(<ProgressBar value={75} max={100} label="CPU Load" showValue={true} />);
    expect(screen.getByText('CPU Load')).toBeDefined();
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('renders EmptyState with action button', () => {
    render(
      <EmptyState
        title="No active alerts"
        description="All system metrics within acceptable ranges."
        action={<button>Refresh</button>}
      />
    );
    expect(screen.getByText('No active alerts')).toBeDefined();
    expect(screen.getByText('All system metrics within acceptable ranges.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDefined();
  });

  it('renders AIThinking spinner and description', () => {
    render(<AIThinking label="Thinking..." />);
    expect(screen.getByText('Thinking...')).toBeDefined();
    expect(screen.getByText('Processing neural reasoning chain...')).toBeDefined();
  });
});
