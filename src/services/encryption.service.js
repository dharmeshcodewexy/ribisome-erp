// External dependencies start here
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// External dependencies end here

// Internal dependencies start here
const { envs } = require("./environment.service");
// Internal dependencies ends here

module.exports = {
  // Make passwords encrypted to store in db
  encrypt: async (text) => {
    try {
      const salt = await bcrypt.genSalt(envs.jwt.crypt_salt_rounds);
      const hash = await bcrypt.hash(text, salt);
      return hash;
    } catch (err) {
      console.error(err);
    }
  },

  // Compare original password with stored in db
  decrypt: async (text, hash) => {
    try {
      return await bcrypt.compare(text, hash);
    } catch (err) {
      // console.error(err);
      return false;
    }
  },

  // Generate JWT token
  generateAccessToken: (payload) => {
    // TODO: Make small expiration time once refresh token logic implemented
    return jwt.sign(
      payload,
      envs.jwt.secret
      //  { expiresIn: envs.jwt.access_token_expire_in }
    );
  },

  // Generate refresh token
  generateRefreshToken: (payload, keep_signin = false) => {
    return jwt.sign(payload, envs.jwt.refresh_secret, {
      expiresIn: (keep_signin && envs.jwt.keep_signin_expire_in) || envs.jwt.refresh_token_expire_in,
    });
  },

  // Generate JWT token
  generateTmpToken: (payload, expiresIn = null, isTTL = true) => {
    const options = isTTL ? { expiresIn: expiresIn || envs.jwt.tmp_token_expire_in } : {};
    return jwt.sign(payload, envs.jwt.secret, options);
  },

  validateTmpToken: (temp_token) => {
    const decodedToken = jwt.verify(temp_token, envs.jwt.secret, (err, decoded) => {
      if (err) {
        throw new Error("Invalid or expired token");
      }
      return decoded;
    });
    return decodedToken;
  },
};
