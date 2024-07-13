'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mahasiswas', {
      mahasiswa_id: {
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
      nama_mahasiswa: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      nik: {
        type: Sequelize.STRING(50), // Perbaiki panjang STRING
        allowNull: false,
      },
      nim: {
        type: Sequelize.STRING(50), // Perbaiki panjang STRING
        allowNull: false,
      },
      nik: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      alamat: {
        type: Sequelize.STRING(255), // Perbaiki panjang STRING
        allowNull: false,
      },
      tempat_lahir: {
        type: Sequelize.STRING(50), // Perbaiki panjang STRING
        allowNull: false,
      },
      tanggal_lahir: { 
        type: Sequelize.DATEONLY, // Gunakan DATEONLY untuk tanggal lahir
        allowNull: false,
      },
      jenis_kelamin: { 
        type: Sequelize.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false,
        defaultValue: 'Laki-laki' // Atur nilai default atau diizinkan null
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
      nomor_hp: { 
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      url_foto: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
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
    await queryInterface.dropTable('mahasiswas');
  }
};
