'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dosen', {
      dosen_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20),
        unique: true,
      },
      nama_dosen: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      nik: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      nidn: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      alamat: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tempat_lahir: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      tanggal_lahir: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      jenis_kelamin: {
        type: Sequelize.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false,
        defaultValue: 'Laki-laki',
      },
      url_foto: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      nomor_hp: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      user_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      prodi_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fakultas_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Adding foreign key constraints
    await queryInterface.addConstraint('dosen', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_dosens_user_id',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('dosen', {
      fields: ['fakultas_id'],
      type: 'foreign key',
      name: 'fk_dosens_fakultas_id',
      references: {
        table: 'fakultas',
        field: 'fakultas_id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('dosen', {
      fields: ['prodi_id'],
      type: 'foreign key',
      name: 'fk_dosens_prodi_id',
      references: {
        table: 'prodi',
        field: 'prodi_id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Dropping the table in the down migration
    await queryInterface.dropTable('dosen');
  }
};
