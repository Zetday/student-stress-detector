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

  /**
   * Returns the current profile_image filename stored for the user,
   * so that the old file can be deleted from disk before saving the new one.
   */
  async getProfilePictureById(id) {
    const query = {
      text: 'SELECT profile_image FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0]?.profile_image ?? null;
  }

  /**
   * Persists the new profile picture filename and invalidates the user cache.
   */
  async updateProfilePicture(id, filename) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE users SET profile_image = $1, updated_at = $2 WHERE id = $3 RETURNING id, profile_image',
      values: [filename, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (result.rows.length) {
      await this.cacheService.delete(`users:${id}`);
    }

    return result.rows[0];
  }
}

export default new ProfileRepositories();

