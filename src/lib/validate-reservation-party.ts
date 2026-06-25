export function validateReservationParty (
  party: number,
  availableSeats: number,
  options: { requirePositive?: boolean } = {}
) {
  const { requirePositive = true } = options

  if (requirePositive && party <= 0) {
    return 'Party must be greater than zero.'
  }

  if (party > availableSeats) {
    return `Party cannot exceed available seats (${availableSeats}).`
  }

  return null
}
