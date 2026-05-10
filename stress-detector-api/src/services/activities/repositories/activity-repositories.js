import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class ActivityRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createActivity({
    userId,
    studyHours,
    sleepHours,
    classAttendance,
    examFrequency,
    assignmentLoad,
    socialActivity,
    caffeineIntake,
    physicalExercise,
    socialMediaUsage,
    screenTime,
    familyIncomeLevel,
    peerPresure,
    familySupport,
    anxietyLevel,
    fatigueLevel,
    mood,
    workHours,
    exerciseMinutes,
    date,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO activities (id, user_id, study_hours, sleep_hours, class_attendance, exam_frequency, assignment_load, social_activity, caffeine_intake, physical_exercise, social_media_usage, screen_time, family_income_level, peer_presure, family_support, anxiety_level, fatigue_level, mood, work_hours, exercise_minutes, date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING id',
      values: [
        id,
        userId,
        studyHours,
        sleepHours,
        classAttendance,
        examFrequency,
        assignmentLoad,
        socialActivity,
        caffeineIntake,
        physicalExercise,
        socialMediaUsage,
        screenTime,
        familyIncomeLevel,
        peerPresure,
        familySupport,
        anxietyLevel,
        fatigueLevel,
        mood,
        workHours,
        exerciseMinutes,
        date,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async getActivitiesByUser(userId) {
    const query = {
      text: 'SELECT * FROM activities WHERE user_id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getActivityById(id) {
    const query = {
      text: 'SELECT * FROM activities WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteActivity(id) {
    const query = {
      text: 'DELETE FROM activities WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async verifyActivityOwner(id, userId) {
    const query = {
      text: 'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      values: [id, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    return result.rows[0];
  }

  async verifyActivityAccess(activityId, userId) {
    const ownerResult = await this.verifyActivityOwner(activityId, userId);

    if (!ownerResult) {
      return null;
    }

    return ownerResult;
  }
}

export default ActivityRepositories;
