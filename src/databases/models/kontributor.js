'use strict'
const { Model } = require('sequelize')
const { nanoid } = require('nanoid')

module.exports = (sequelize, DataTypes) => {
  class Kontributor extends Model {
    static associate (models) {
      // Define associations here
      Kontributor.belongsTo(models.researchs, { foreignKey: 'research_id' })
      Kontributor.belongsTo(models.finalprojects, { foreignKey: 'project_id' })
    }
  }

  Kontributor.init(
    {
      kontributor_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      research_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      project_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
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
      modelName: 'kontributor'
    }
  )
  return Kontributor
}
