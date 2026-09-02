"use strict";

const { hashSync } = require("bcryptjs");
const { envs } = require("../../services/environment.service");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create default superadmin user
    const defaultPassword = "Superadmin@123"; // Default password - MUST be changed in production
    const hashedPassword = hashSync(defaultPassword, 10);

    // Insert default superadmin user
    const user = await queryInterface.bulkInsert(
      envs.tables.users,
      [
        {
          fullname: "Super Admin",
          email: "superadmin@ribisome.com",
          password: hashedPassword,
          phone: "9876543210",
          user_code: "SA001",
          role_id: 1, // superadmin role
          status: 1, // active
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // Assign superadmin role to the user (if user_roles table exists)
    if (user && user.length > 0) {
      await queryInterface.bulkInsert(envs.tables.user_roles, [
        {
          user_id: user[0].id || 1,
          role_id: 1, // superadmin
          assigned_at: new Date(),
          assigned_by: 1,
          is_primary: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    const { envs } = require("../../services/environment.service");

    // Delete user_roles assignment for superadmin
    await queryInterface.sequelize.query(
      `DELETE FROM ${envs.tables.user_roles} WHERE user_id = 1`
    );

    // Delete default superadmin user
    await queryInterface.sequelize.query(
      `DELETE FROM ${envs.tables.users} WHERE email = 'superadmin@ribisome.com'`
    );
  },
};
