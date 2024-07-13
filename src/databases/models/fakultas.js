'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Fakultas extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  Fakultas.init(
    {
      user_id: {
        type: DataTypes.STRING(20), // Sesuaikan dengan tipe data yang Anda gunakan untuk userId
        allowNull: false
      },
      fakultas_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
        allowNull: false
        
      },
      nama_fakultas: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      kode: {
        type: DataTypes.STRING(10),
        allowNull: false,
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
      modelName: 'fakultas',
    }
  );
  return Fakultas;
};
