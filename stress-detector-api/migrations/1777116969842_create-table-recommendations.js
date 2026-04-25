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
  pgm.createTable('recommendations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    activity_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'activities(id)',
      onDelete: 'CASCADE',
    },
    recommendation_text: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint('recommendations', 'fk_recommendations_user_id', {
    foreignKeys: 'user_id',
    references: 'users(id)',
    onDelete: 'CASCADE',
  });

  pgm.addConstraint('recommendations', 'fk_recommendations_activity_id', {
    foreignKeys: 'activity_id',
    references: 'activities(id)',
    onDelete: 'CASCADE',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('recommendations');
  pgm.dropConstraint('recommendations', 'fk_recommendations_user_id');
  pgm.dropConstraint('recommendations', 'fk_recommendations_activity_id');
};
