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
    sleep_hours: {
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
    exercise_minutes: {
      type: 'INTEGER',
      notNull: true,
    },
    fatigue_level: {
      type: 'INTEGER',
      notNull: true,
    },
    mood: {
      type: 'INTEGER',
      notNull: true,
    },
    caffeine_intake: {
      type: 'INTEGER',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
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
