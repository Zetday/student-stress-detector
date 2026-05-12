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
  pgm.createTable('activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    sleep_hours: {
      type: 'DECIMAL(4,2)',
      notNull: true,
    },
    study_hours: {
      type: 'DECIMAL(4,2)',
      notNull: true,
    },
    screen_time_hours: {
      type: 'DECIMAL(4,2)',
      notNull: true,
    },
    social_media_hours: {
      type: 'DECIMAL(4,2)',
      notNull: true,
    },
    physical_activity_minutes: {
      type: 'INTEGER',
      notNull: true,
    },
    caffeine_intake_mg: {
      type: 'INTEGER',
      notNull: true,
    },
    mood_score: {
      type: 'INTEGER',
      notNull: true,
    },
    fatigue_level: {
      type: 'INTEGER',
      notNull: true,
    },
    assignment_load: {
      type: 'FLOAT',
      notNull: true,
    },
    deadlines_pressure: {
      type: 'INTEGER',
      notNull: true,
    },
    social_interaction_score: {
      type: 'INTEGER',
      notNull: true,
    },
    financial_worry_score: {
      type: 'INTEGER',
      notNull: true,
    },
    health_condition_score: {
      type: 'INTEGER',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'activities',
    'fk_activities.user_id_users.id',
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
