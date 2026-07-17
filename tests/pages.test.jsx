import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../src/pages/LandingPage';
import OverviewPage from '../src/pages/OverviewPage';
import JuryPortal from '../src/pages/JuryPortal';
import VolunteerCopilot from '../src/pages/VolunteerCopilot';

describe('LandingPage Tests', () => {
  it('renders landing page titles and taglines', () => {
    render(<LandingPage onSelectMode={vi.fn()} />);
    expect(screen.getByText('PULSE')).toBeDefined();
    expect(screen.getByText(/Intelligent FIFA World Cup 2026/)).toBeDefined();
  });

  it('triggers mode selection when clicking cards', () => {
    const handleSelect = vi.fn();
    render(<LandingPage onSelectMode={handleSelect} />);
    
    const commandCard = screen.getByRole('button', { name: /Command Center/ });
    expect(commandCard).toBeDefined();
    
    fireEvent.click(commandCard);
    expect(handleSelect).toHaveBeenCalledWith('command');
  });
});

describe('OverviewPage Tests', () => {
  it('renders overview widgets, gates list, and simulation banner', () => {
    render(<OverviewPage />);
    expect(screen.getByText('Total Occupancy')).toBeDefined();
    expect(screen.getAllByText('Active Incidents')[0]).toBeDefined();
    expect(screen.getByText('Stadium Intelligence View')).toBeDefined();
  });
});

describe('JuryPortal Tests', () => {
  it('renders evaluate section, description, and status checks', () => {
    render(<JuryPortal />);
    expect(screen.getByText('Jury Evaluation Portal')).toBeDefined();
    expect(screen.getByText(/Upload stadium data/)).toBeDefined();
  });
});

describe('VolunteerCopilot Tests', () => {
  it('renders co-pilot interface home layout', () => {
    render(<VolunteerCopilot />);
    expect(screen.getByText('PULSEGRID')).toBeDefined();
    expect(screen.getByText('Volunteer Co-Pilot')).toBeDefined();
  });
});
