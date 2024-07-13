'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class FinalProjects extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  FinalProjects.init(
    {
      project_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Using nanoid with length 20
        allowNull: false,
      },
      user_id: {
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
      penulis: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nim: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      kontributor: {
        type: DataTypes.STRING(50),
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
      catatan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      nama_prodi: {
        type: DataTypes.STRING(50),
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
        type: DataTypes.NOW,
        allowNull: true,
      },
      aprovaldate: {
        type: DataTypes.NOW,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending' // Atur nilai default atau diizinkan null
      },
      total_views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default value for total views
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
