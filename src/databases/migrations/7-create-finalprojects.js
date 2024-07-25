'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('finalprojects', {
      project_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20),
        unique: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      title_eng: {
        type: Sequelize.STRING(255),
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
      url_finalprojects: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      mahasiswa_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      prodi_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
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

    await queryInterface.addConstraint('finalprojects', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_finalprojects_user_id',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });


    await queryInterface.addConstraint('finalprojects', {
      fields: ['mahasiswa_id'],
      type: 'foreign key',
      name: 'fk_finalprojects_mahasiswa_id',
      references: {
        table: 'mahasiswa',
        field: 'mahasiswa_id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('finalprojects', {
      fields: ['fakultas_id'],
      type: 'foreign key',
      name: 'fk_finalprojects_fakultas_id',
      references: {
        table: 'fakultas',
        field: 'fakultas_id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('finalprojects', {
      fields: ['prodi_id'],
      type: 'foreign key',
      name: 'fk_finalprojects_prodi_id',
      references: {
        table: 'prodi',
        field: 'prodi_id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('finalprojects');
  }
};
