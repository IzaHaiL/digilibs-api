'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Prodi extends Model {
    static associate(models) {
      // define associations here
    }

    
  }
  Prodi.init(
    {
      prodi_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
        allowNull: false
      },
      nama_prodi: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      kode: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(20), // Sesuaikan dengan tipe data yang Anda gunakan untuk userId
        allowNull: false
      },
      fakultas_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nama_fakultas: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'prodis'
    }
  );
  return Prodi;
};
