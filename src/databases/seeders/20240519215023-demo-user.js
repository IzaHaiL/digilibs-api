'use strict';
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const passwordHash = await bcrypt.hash('admin', 10);
    const commonPasswordHash = await bcrypt.hash('password', 10);

    // Create users
    const users = [
      {
        user_id: nanoid(20),
        username: 'admin',
        email: 'admin@example.com',
        password: passwordHash,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: nanoid(20),
        username: 'mahasiswa',
        email: 'mahasiswa@example.com',
        password: commonPasswordHash,
        role: 'mahasiswa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: nanoid(20),
        username: 'dosen',
        email: 'dosen@example.com',
        password: commonPasswordHash,
        role: 'dosen',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: nanoid(20),
        username: 'prodi',
        email: 'prodi@example.com',
        password: commonPasswordHash,
        role: 'prodi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: nanoid(20),
        username: 'fakultas',
        email: 'fakultas@example.com',
        password: commonPasswordHash,
        role: 'fakultas',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: nanoid(20),
        username: 'lppm',
        email: 'lppm@example.com',
        password: commonPasswordHash,
        role: 'lppm',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});

    // Create mahasiswa entries with only user_id
    const mahasiswas = [
      {
        user_id: users[1].user_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('mahasiswas', mahasiswas, {});

    // Create dosen entries with only user_id
    const dosens = [
      {
        user_id: users[2].user_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('dosens', dosens, {});

    // Create prodi entries with only user_id
    const prodis = [
      {
        user_id: users[3].user_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('prodis', prodis, {});

    // Create fakultas entries with only user_id
    const fakultas = [
      {
        user_id: users[4].user_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('fakultas', fakultas, {});

    // Create lppm entries with only user_id
    const lppms = [
      {
        user_id: users[5].user_id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await queryInterface.bulkInsert('lppms', lppms, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mahasiswas', null, {});
    await queryInterface.bulkDelete('dosens', null, {});
    await queryInterface.bulkDelete('prodis', null, {});
    await queryInterface.bulkDelete('fakultas', null, {});
    await queryInterface.bulkDelete('lppms', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
