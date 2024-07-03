'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Mahasiswa extends Model {
    static associate(models) {
      // Define associations here if needed
    }
    
  }
  Mahasiswa.init(
    {
      user_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
        allowNull: false,
        unique: true,
      },
      mahasiswa_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
      },
      nama_mahasiswa: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nik: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      nim: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      alamat: {
        type: DataTypes.STRING(255), // Perpanjang panjang STRING
        allowNull: true,
      },
      tempat_lahir: {
        type: DataTypes.STRING(50), // Perpanjang panjang STRING
        allowNull: true,
      },
      tanggal_lahir: { 
        type: DataTypes.DATEONLY, // Gunakan DATEONLY untuk tanggal lahir
        allowNull: true,
      },
      jenis_kelamin: { 
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false,
        defaultValue: 'Laki-laki' // Atur nilai default atau diizinkan null
      },
      url_foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fakultas_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nama_fakultas: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      prodi_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nama_prodi: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nomor_hp: { 
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'mahasiswas', // Perhatikan penulisan modelName yang harus dimulai dengan huruf besar
    }
  );
  return Mahasiswa;
};
