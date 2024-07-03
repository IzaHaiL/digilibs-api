'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class LPPM extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  LPPM.init(
    {
      user_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Using nanoid with length 20
        allowNull: false,
        unique: true,
      },
      lppm_id: {
        type: DataTypes.INTEGER(20),
        allowNull: false,
        unique: true,
        defaultValue: () => nanoid(20), // Using nanoid with length 20
      },
      nama_lppm: {
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
      modelName: 'lppms',
    }
  );
  return LPPM;
};
