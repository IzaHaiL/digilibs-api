'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Research table
    await queryInterface.createTable('research', {
      research_id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      dosen_id: {
        type: Sequelize.STRING(20),
        allowNull: true,

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
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      abstract_eng: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      kategori: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      catatan: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      kontributor: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      url_research: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      berkas_research: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      submissionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      },
      approvaldate: {
        type: Sequelize.DATE,
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
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: false,

      },
      prodi_id: {
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
    await queryInterface.addConstraint('research', {
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

    await queryInterface.addConstraint('research', {
      fields: ['dosen_id'],
      type: 'foreign key',
      name: 'fk_researches_dosen_id',
      references: {
        table: 'dosens',
        field: 'dosen_id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('research', {
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

    await queryInterface.addConstraint('research', {
      fields: ['prodi_id'],
      type: 'foreign key',
      name: 'fk_researches_prodi_id',
      references: {
        table: 'prodis',
        field: 'prodi_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop Research table
    await queryInterface.dropTable('research');
  }
};
