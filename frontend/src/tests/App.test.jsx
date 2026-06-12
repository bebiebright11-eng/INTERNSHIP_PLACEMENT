import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function TestComponent() {
  return <h1>Internship Placement System</h1>
}

describe('TestComponent', () => {
  it('renders the title', () => {
    render(<TestComponent />)

    expect(
      screen.getByText('Internship Placement System')
    ).toBeTruthy()
  })
})