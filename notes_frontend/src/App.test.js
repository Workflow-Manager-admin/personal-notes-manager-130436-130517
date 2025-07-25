import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Integration test: shows login, then register, then logs in, then note creation, then note list rendering
test('end-to-end: login/register flow, note creation, and note listing', async () => {
  render(<App />);
  // Initially, prompt to login
  expect(screen.getByText(/please log in or register/i)).toBeInTheDocument();
  // Open Register Modal
  fireEvent.click(screen.getByText(/register/i));
  expect(screen.getByText(/register/i)).toBeInTheDocument();

  // Try blank submission
  fireEvent.click(screen.getByText('Register'));
  expect(screen.getByText(/required/i)).toBeInTheDocument();

  // Switch to login modal
  fireEvent.click(screen.getByText(/login here/i));
  await waitFor(() => expect(screen.getByText(/login/i)).toBeInTheDocument());

  // Now open register, fill and submit
  fireEvent.click(screen.getByText(/register here/i));
  const usernameField = screen.getByPlaceholderText(/username/i);
  const passwordField = screen.getByPlaceholderText(/password/i);

  fireEvent.change(usernameField, { target: { value: 'testuser' } });
  fireEvent.change(passwordField, { target: { value: 'testpassw0rd' } });

  fireEvent.click(screen.getByText('Register'));
  // Wait for auto-login modal to open
  await waitFor(() => expect(screen.getByText(/login/i)).toBeInTheDocument());

  // Enter credentials for login now
  fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'testuser' } });
  fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'testpassw0rd' } });

  fireEvent.click(screen.getByText('Login'));
  // Wait for the note list
  await waitFor(() => expect(screen.getByText('+ New Note')).toBeInTheDocument());

  // Create a new note
  fireEvent.click(screen.getByText('+ New Note'));
  await waitFor(() => expect(screen.getByText(/create note/i)).toBeInTheDocument());

  const titleInput = screen.getByPlaceholderText('Title');
  fireEvent.change(titleInput, { target: { value: 'Test Note' } });
  const contentInput = screen.getByPlaceholderText('Content');
  fireEvent.change(contentInput, { target: { value: 'Testing note content' } });
  // Save note
  fireEvent.click(screen.getByText('Create'));
  // Wait for new note to appear in list
  await waitFor(() => expect(screen.getByText('Test Note')).toBeInTheDocument());
});
