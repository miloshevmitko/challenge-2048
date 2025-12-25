/**
 * Generate a cryptographically secure random number between min and max.
 */
export function cryptoRandomInt(min: number, max: number) {
  if (min > max) {
    throw new Error("Minimum value must be less than maximum value.");
  }

  const range = max - min + 1;
  if (range <= 0) {
    throw new Error("Range must be positive.");
  }

  // Calculate the maximum valid random value to avoid modulo bias.
  const maxValid = Math.floor(0xffffffff / range) * range;

  let random32;
  do {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    random32 = array[0]!;
  } while (random32 >= maxValid);

  return min + (random32 % range);
}
