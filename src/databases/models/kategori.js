'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    static associate(models) {
      // Many-to-many relationship with FinalProjects
      Kategori.belongsToMany(models.finalprojects, {
        through: 'kategorifinalprojects',
        foreignKey: 'kategori_id',
        otherKey: 'project_id',
      });

      // Many-to-many relationship with Researchs
      Kategori.belongsToMany(models.researchs, {
        through: 'kategoriresearchs',
        foreignKey: 'kategori_id',
        otherKey: 'research_id',
      });
    }
  }

  Kategori.init(
    {
      kategori_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      nama_kategori: {
        type: DataTypes.STRING(100),
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
      modelName: 'kategori',
    }
  );

  return Kategori;
};
