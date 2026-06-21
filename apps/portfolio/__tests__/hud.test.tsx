import { render, screen } from '@testing-library/react-native';

import { GCKV } from '../components/hud';

// RNTL v14: render() is async and must be awaited.
describe('<GCKV />', () => {
  it('renders the label and its value', async () => {
    await render(<GCKV label="Role" value="Senior RN Engineer" />);

    expect(screen.getByText('Senior RN Engineer')).toBeOnTheScreen();
    expect(screen.getByText('Role')).toBeOnTheScreen();
  });

  it('renders the value with the right-aligned variant', async () => {
    await render(<GCKV label="Status" value="Open to work" align="right" />);

    expect(screen.getByText('Open to work')).toBeOnTheScreen();
  });
});
