import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import CacheService from '../../../cache/redis-service.js';

class ProfileRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async updateUserInfo(id, { fullname, email }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE users SET fullname = $1, email = $2, updated_at = $3 WHERE id = $4 RETURNING id, fullname, email',
      values: [fullname, email, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (result.rows.length) {
      await this.cacheService.delete(`users:${id}`);
    }

    return result.rows[0];
  }

  async verifyUserPasswordById(id, password) {
    const query = {
      text: 'SELECT password FROM users WHERE id = $1',
      values: [id],
    };

    const user = await this.pool.query(query);
    if (user.rows.length === 0) {
      return false;
    }

    const { password: hashedPassword } = user.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    return isPasswordMatch;
  }

  async updateUserPassword(id, hashedPassword) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [hashedPassword, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (result.rows.length) {
      await this.cacheService.delete(`users:${id}`);
    }

    return result.rows[0];
  }

  async verifyNewEmail(email, currentUserId) {
    const query = {
      text: 'SELECT id FROM users WHERE email = $1 AND id != $2',
      values: [email, currentUserId],
    };

    const result = await this.pool.query(query);

    return result.rows.length > 0;
  }
}

export default new ProfileRepositories();
