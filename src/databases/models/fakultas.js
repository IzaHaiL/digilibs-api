'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Fakultas extends Model {
    static associate(models) {
      Fakultas.belongsTo(models.users, { foreignKey: 'user_id' });
      Fakultas.hasMany(models.prodi, { foreignKey: 'fakultas_id' });
      Fakultas.hasMany(models.mahasiswa, { foreignKey: 'fakultas_id' });
      Fakultas.hasMany(models.dosen, { foreignKey: 'fakultas_id' });
    }
  }

  Fakultas.init(
    {
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
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false
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
