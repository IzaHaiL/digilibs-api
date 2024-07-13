'use strict';

const { sequelize } = require('../models');

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
      penulis: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      nim: {
        type: Sequelize.STRING(50), // Perbaiki panjang STRING
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
      url_finalprojects: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      berkas_finalprojects: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      catatan: {
        type: sequelize.STRING(500),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending' // Atur nilai default atau diizinkan null
      },
      submissionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      aprovaldate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      total_views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default value for total views
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