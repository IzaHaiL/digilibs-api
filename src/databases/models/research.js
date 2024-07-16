'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Research extends Model {
    static associate(models) {
      // Define associations here
      Research.belongsTo(models.user, { foreignKey: 'user_id' });
      Research.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      Research.belongsTo(models.prodis, { foreignKey: 'prodi_id' });
      Research.belongsTo(models.dosens, { foreignKey: 'dosen_id' });

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
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      abstract_eng: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      kategori: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      catatan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      kontributor: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      url_research: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      berkas_research: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      submissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvaldate: {
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
      modelName: 'research',
    }
  );
  return Research;
};
