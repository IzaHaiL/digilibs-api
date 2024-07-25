'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prodi', {
      prodi_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20),
        unique: true,
      },
      nama_prodi: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      fakultas_id: {
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
    await queryInterface.addConstraint('prodi', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_prodis_user_id',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('prodi', {
      fields: ['fakultas_id'],
      type: 'foreign key',
      name: 'fk_prodis_fakultas_id',
      references: {
        table: 'fakultas',
        field: 'fakultas_id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prodi');
  }
};
