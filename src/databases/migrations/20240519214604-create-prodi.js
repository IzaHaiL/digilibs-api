'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prodis', {
      prodi_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true // Pastikan userId unik
      },
      nama_prodi: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      kode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      nama_fakultas: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      // Tambahkan atribut lain yang diperlukan untuk model prodi
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('prodis');
  }
};
