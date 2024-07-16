'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class LPPM extends Model {
    static associate(models) {
      LPPM.belongsTo(models.user, { foreignKey: 'user_id' });
    }
  }
  
  LPPM.init(
    {
      lppm_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20), // Menggunakan nanoid dengan panjang 20
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false
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
