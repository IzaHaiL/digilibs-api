'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lppm', {
      lppm_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20),
        unique: true,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      nama_lppm: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('lppm', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_lppms_user_id',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lppm');
  }
};
