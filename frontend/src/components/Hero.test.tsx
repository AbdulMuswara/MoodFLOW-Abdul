import { render, screen } from '@testing-library/react'
import Hero from './Hero'

describe('Hero', () => {
  it('renders main headline', () => {
    render(<Hero />)

    expect(
      screen.getByRole('heading', { name: /track your mood/i })
    ).toBeInTheDocument()
  })

  it('renders CTA links', () => {
    render(<Hero />)

    expect(screen.getByRole('link', { name: /start tracking free/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })
})