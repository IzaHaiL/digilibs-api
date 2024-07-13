'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Dosen extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  Dosen.init(
    {
      user_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Using nanoid with length 20
        allowNull: false,
        unique: true,
      },
      dosen_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(20), // Using nanoid with length 20
      },
      nama_dosen: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nik: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      nidn: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      alamat: {
        type: DataTypes.STRING(255), // Perbaiki panjang STRING
        allowNull: true,
      },
      tempat_lahir: {
        type: DataTypes.STRING(50), // Perbaiki panjang STRING
        allowNull: true,
      },
      tanggal_lahir: { 
        type: DataTypes.DATEONLY, // Gunakan DATEONLY untuk tanggal lahir
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
      jenis_kelamin: { 
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false,
        defaultValue: 'Laki-laki' // Atur nilai default atau diizinkan null
      },
      url_foto: {
        type: DataTypes.STRING(255),
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
      modelName: 'dosens', // Perhatikan penulisan modelName yang harus dimulai dengan huruf besar
    }
  );
  return Dosen;
};
