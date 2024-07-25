"use strict";
const { Model } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  class Mahasiswa extends Model {
    static associate(models) {
      Mahasiswa.belongsTo(models.users, { foreignKey: 'user_id' });
      Mahasiswa.belongsTo(models.fakultas, { foreignKey: 'fakultas_id' });
      Mahasiswa.belongsTo(models.prodi, { foreignKey: 'prodi_id' });
      Mahasiswa.hasMany(models.finalprojects, { foreignKey: 'mahasiswa_id' });
    }
  }

  Mahasiswa.init(
    {
      mahasiswa_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        defaultValue: () => nanoid(20),
        allowNull: false,
        unique: true,
      },
      nama_mahasiswa: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nik: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      nim: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      alamat: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tempat_lahir: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      jenis_kelamin: {
        type: DataTypes.ENUM("Laki-laki", "Perempuan"),
        allowNull: false,
        defaultValue: "Laki-laki",
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
      modelName: "mahasiswa",
    }
  );

  return Mahasiswa;
};
