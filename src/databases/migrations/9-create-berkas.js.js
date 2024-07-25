'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('berkas', {
      berkas_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      url_berkas: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      research_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      project_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('berkas', {
      fields: ['project_id'],
      type: 'foreign key',
      name: 'fk_berkas_project_id',
      references: {
        table: 'finalprojects',
        field: 'project_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
    await queryInterface.addConstraint('berkas', {
      fields: ['research_id'],
      type: 'foreign key',
      name: 'fk_berkas_research_id',
      references: {
        table: 'researchs',
        field: 'research_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Drop Research table
    await queryInterface.dropTable('berkas');
  }
};
