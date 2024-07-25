'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class Dosen extends Model {
    static associate(models) {
      Dosen.belongsTo(models.users, { foreignKey: 'user_id' });
      Dosen.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      Dosen.belongsTo(models.prodi, { foreignKey: 'prodi_id' });
      Dosen.hasMany(models.researchs, { foreignKey: 'dosen_id' });
      Dosen.belongsToMany(models.finalprojects, {
        through: 'dosenfinalprojects',
        foreignKey: 'dosen_id',
        otherKey: 'project_id',
      });
      Dosen.belongsToMany(models.researchs, {
        through: 'dosenresearchs',
        foreignKey: 'dosen_id',
        otherKey: 'research_id',
      });
      

    }
  }

  Dosen.init(
    {
      dosen_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false,
        unique: true,
      },
      nama_dosen: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nik: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      nidn: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      alamat: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tempat_lahir: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      jenis_kelamin: {
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false,
        defaultValue: 'Laki-laki',
      },
      url_foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nomor_hp: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      prodi_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      fakultas_id: {
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
      modelName: 'dosen', // modelName harus dimulai dengan huruf besar
    }
  );

  return Dosen;
};
