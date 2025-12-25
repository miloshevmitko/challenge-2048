/**
 * Generate a cryptographically secure random number between 0 and 1.
 */
export function cryptoRandom() {
  // Create a typed array with one 32-bit unsigned integer.
  const array = new Uint32Array(1);
  // Fill it with cryptographically secure random values.
  crypto.getRandomValues(array);
  // Normalize to a floating-point number between 0 and 1.
  return array[0]! / (0xffffffff + 1);
}
