'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Research extends Model {
    static associate(models) {
      // define associations here
    }
  }
  Research.init(
    {
      research_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), 
        allowNull: false
      },
      user_id: {
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
      catatan: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      penulis: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nidn: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      kontributor: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fakultas_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nama_fakultas: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      prodi_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nama_prodi: {
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
        type: DataTypes.NOW,
        allowNull: true,
      },
      aprovaldate: {
        type: DataTypes.NOW,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Aproved', 'Rejected'),
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
      modelName: 'research'
    }
  );
  return Research;
};
