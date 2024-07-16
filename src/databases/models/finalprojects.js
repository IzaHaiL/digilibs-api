'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class FinalProjects extends Model {
    static associate(models) {
      // Define associations here
      FinalProjects.belongsTo(models.user, { foreignKey: 'user_id' });
      FinalProjects.belongsTo(models.mahasiswas, { foreignKey: 'mahasiswa_id' });
      FinalProjects.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      FinalProjects.belongsTo(models.prodis, { foreignKey: 'prodi_id' });
    }
  }
  
  FinalProjects.init(
    {
      project_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      mahasiswa_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      title_eng: {
        type: DataTypes.STRING(255),
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
      kontributor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      catatan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      url_finalprojects: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      berkas_finalprojects: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      submissionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
      approvalDate: { // Changed from 'aprovaldate' to 'approvalDate'
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
        allowNull: true,
      },
      prodi_id: {
        type: DataTypes.STRING(50),
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
      modelName: 'finalprojects',
    }
  );
  return FinalProjects;
};
