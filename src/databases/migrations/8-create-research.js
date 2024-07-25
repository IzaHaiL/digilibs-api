'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create researchs table
    await queryInterface.createTable('researchs', {
      research_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      title_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      abstract: {
        type: Sequelize.STRING(2000),
        allowNull: false,
      },
      abstract_eng: {
        type: Sequelize.STRING(2000),
        allowNull: false,
      },
      catatan: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      total_views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      url_research: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      dosen_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      prodi_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      submissionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      },
      approvalDate: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addConstraint('researchs', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_researches_user_id',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });

    await queryInterface.addConstraint('researchs', {
      fields: ['dosen_id'],
      type: 'foreign key',
      name: 'fk_researches_dosen_id',
      references: {
        table: 'dosen',
        field: 'dosen_id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('researchs', {
      fields: ['fakultas_id'],
      type: 'foreign key',
      name: 'fk_researches_fakultas_id',
      references: {
        table: 'fakultas',
        field: 'fakultas_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });

    await queryInterface.addConstraint('researchs', {
      fields: ['prodi_id'],
      type: 'foreign key',
      name: 'fk_researches_prodi_id',
      references: {
        table: 'prodi',
        field: 'prodi_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop researchs table
    await queryInterface.dropTable('researchs');
  }
};
