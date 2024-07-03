'use strict';
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('1234567111', 10); // Ganti 'yourpassword' dengan password yang diinginkan

    await queryInterface.bulkInsert('users', [
      {
        user_id: nanoid(20),
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: passwordHash,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
