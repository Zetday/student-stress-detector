import { Pool } from 'pg';

class AuthenticationRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async addRefreshToken(id, userId, token, deviceInfo, expiresAt, createdAt) {
    const query = {
      text: 'INSERT INTO authentications (id, user_id, token, device_info, expires_at, created_at) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, userId, token, deviceInfo, expiresAt, createdAt],
    };

    await this.pool.query(query);
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this.pool.query(query);
  }

  async deleteRefreshTokenByUserId(userId) {
    const query = {
      text: 'DELETE FROM authentications WHERE user_id = $1',
      values: [userId],
    };
    await this.pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT * FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      return false;
    }

    return result.rows[0];
  }
}

export default new AuthenticationRepositories();
