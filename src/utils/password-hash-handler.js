import crypto from "crypto";

/**
 * Generate an MD5 hash of a password and include expiration date
 * @param {string} password - The plain text password
 * @returns {object} - An object containing the hash, and passwordExpiredAt
 */
function hashPasswordWithExpiry(password) {
  const hash = crypto.createHash("md5").update(password).digest("hex");
  const passwordExpiredAt = new Date(); // Clone createdAt
  passwordExpiredAt.setMonth(passwordExpiredAt.getMonth() + 3); // Add 3 months
  return { hash, passwordExpiredAt };
}

/**
 * Verify a password against an MD5 hash and check expiry
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The original MD5 hash
 * @param {Date} passwordExpiredAt - The expiration timestamp of the password
 * @returns {boolean} - True if the password is valid and not expired, false otherwise
 */
function verifyPasswordWithExpiry(password, hash, passwordExpiredAt) {
  const newHash = crypto.createHash("md5").update(password).digest("hex");
  const isExpired = new Date() > passwordExpiredAt; // Check if passwordExpiredAt is in the past
  return newHash === hash && !isExpired;
}

export default {
  hashPasswordWithExpiry,
  verifyPasswordWithExpiry,
};
