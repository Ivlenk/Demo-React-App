import {render, screen} from '@testing-library/react';
import App from './App';

test('renders main view including phrase with work done', () => {
  render(<App />);
  const linkElement = screen.getByText(/ work done/i);
  expect(linkElement).toBeInTheDocument();
});
