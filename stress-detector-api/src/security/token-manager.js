import jwt from 'jsonwebtoken';
import AuthenticationError from '../exceptions/authentication-error.js';

const TokenManager = {
  generateAccessToken: (payload) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' }),
  generateRefreshToken: (payload) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' }),
  verifyRefreshToken: (refreshToken) => {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return payload;
    } catch (error) {
      console.log(error);
      throw new AuthenticationError('Refresh token tidak valid');
    }
  },
  verify: (accessToken, secret) => {
    try {
      const payload = jwt.verify(accessToken, secret);
      return payload;
    } catch (error) {
      console.log(error);
      throw new AuthenticationError('Access token tidak valid');
    }
  },
};

export default TokenManager;
