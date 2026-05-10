/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('daily_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    study_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    sleep_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    class_attendance: {
      type: 'FLOAT',
      notNull: true,
    },
    exam_frequency: {
      type: 'INTEGER',
      notNull: true,
    },
    assignment_load: {
      type: 'FLOAT',
      notNull: true,
    },
    work_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    screen_time: {
      type: 'FLOAT',
      notNull: true,
    },
    social_media_use: {
      type: 'FLOAT',
      notNull: true,
    },
    physical_exercise: {
      type: 'BOOLEAN',
      notNull: true,
    },
    exercise_minutes: {
      type: 'INTEGER',
      notNull: true,
    },
    caffeine_intake_mg: {
      type: 'FLOAT',
      notNull: true,
    },
    family_income_level: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    family_support: {
      type: 'FLOAT',
      notNull: true,
    },
    peer_pressure: {
      type: 'FLOAT',
      notNull: true,
    },
    anxiety_level: {
      type: 'FLOAT',
      notNull: true,
    },
    fatigue_level: {
      type: 'FLOAT',
      notNull: true,
    },
    mood: {
      type: 'FLOAT',
      notNull: true,
    },
    date: {
      type: 'DATE',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'daily_activities',
    'fk_daily_activities.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('daily_activities');
};
