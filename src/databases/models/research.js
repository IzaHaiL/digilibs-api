'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Research extends Model {
    static associate(models) {
      // Define associations here
      Research.belongsTo(models.users, { foreignKey: 'user_id' });
      Research.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      Research.belongsTo(models.prodi, { foreignKey: 'prodi_id' });
      Research.belongsTo(models.dosen, { foreignKey: 'dosen_id' });
      Research.hasMany(models.berkas, { foreignKey: 'research_id', as: 'berkas' });

      Research.belongsToMany(models.kategori, {
        through: 'kategoriresearchs',
        foreignKey: 'research_id',
        as: 'kategori',

        otherKey: 'kategori_id',
      });
      Research.belongsToMany(models.dosen, {
        through: 'dosenresearchs',
        as: 'kontributor',
        foreignKey: 'research_id',
        otherKey: 'dosen_id',
      });

    }
  }
  Research.init(
    {
      research_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      dosen_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      title_eng: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      abstract: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      abstract_eng: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      catatan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      url_research: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      submissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvalDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      total_views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fakultas_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      prodi_id: {
        type: DataTypes.STRING(50),
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
      modelName: 'researchs',
    }
  );
  return Research;
};
