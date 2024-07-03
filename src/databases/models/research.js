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
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true // Pastikan userId unik
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      abstract: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      penulis: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      ulr_research: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      berkas_research: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      submissionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_validated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
