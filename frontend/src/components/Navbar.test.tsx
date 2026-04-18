import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'

jest.mock('../lib/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Navbar', () => {
  it('renders the main navigation links', () => {
    render(<Navbar />)

    const navLinks = [/features/i, /how it works/i]

    navLinks.forEach((name) => {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    })
  })

  it('renders the sign in link', () => {
    render(<Navbar />)

    expect(
      screen.getByRole('link', { name: /sign in/i })
    ).toBeInTheDocument()
  })
})