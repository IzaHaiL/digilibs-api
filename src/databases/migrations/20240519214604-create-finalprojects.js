'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { nanoid } = await import('nanoid');

    // Tabel finalprojects
    await queryInterface.createTable('finalprojects', {
      project_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(20) // Using nanoid for default value
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true // Pastikan userId unik
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      abstact: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      penulis: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      kontributor: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      nama_fakultas: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      prodi_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      nama_prodi: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ulr_finalprojects: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      berkas_finalprojects: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      is_validated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      submissionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('finalprojects');
  }
};
