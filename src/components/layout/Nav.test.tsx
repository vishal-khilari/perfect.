import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders all links', () => {
    render(<Nav />);
    expect(screen.getByText(/the door/i)).toBeInTheDocument();
    expect(screen.getByText(/the room/i)).toBeInTheDocument();
    expect(screen.getByText(/leave something/i)).toBeInTheDocument();
  });
});
