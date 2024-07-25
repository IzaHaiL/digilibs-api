'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Prodi extends Model {
    static associate(models) {
      Prodi.belongsTo(models.users, { foreignKey: 'user_id' });
      Prodi.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      Prodi.hasMany(models.mahasiswa, { foreignKey: 'prodi_id' });
      Prodi.hasMany(models.dosen, { foreignKey: 'prodi_id' });
    }
  }

  Prodi.init(
    {
      prodi_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false
      },
      nama_prodi: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(20), 
        allowNull: false
      },
      fakultas_id: {
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
      modelName: 'prodi'
    }
  );

  return Prodi;
};
