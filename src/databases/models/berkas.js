'use strict'
const { Model } = require('sequelize')
const { nanoid } = require('nanoid')

module.exports = (sequelize, DataTypes) => {
  class Berkas extends Model {
    static associate (models) {
      // Define associations here
      Berkas.belongsTo(models.researchs, { foreignKey: 'research_id' })
      Berkas.belongsTo(models.finalprojects, { foreignKey: 'project_id' })
    }
  }

  Berkas.init(
    {
      berkas_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false
      },
      url_berkas: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      research_id: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      project_id: {
        type: DataTypes.STRING(20),
        allowNull: true
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
      modelName: 'berkas'
    }
  )
  return Berkas
}
