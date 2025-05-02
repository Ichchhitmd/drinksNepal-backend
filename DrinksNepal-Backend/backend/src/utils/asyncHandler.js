/**
 * Wraps an asynchronous function to handle errors in Express middleware
 * @param {Function} fn - The asynchronous function to wrap
 * @returns {Function} A middleware function that catches any errors and passes them to the next middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
