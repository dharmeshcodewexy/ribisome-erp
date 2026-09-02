"use strict";

const { envs } = require("../../services/environment.service");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table_name = envs.tables.login_sessions;
    const users_table = envs.tables.users;

    await queryInterface.createTable(table_name, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: users_table,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "logged_out", "expired"),
        defaultValue: "active",
      },
      logout_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex(table_name, ["user_id"]);
    await queryInterface.addIndex(table_name, ["status"]);
    await queryInterface.addIndex(table_name, ["access_token"]);
  },

  async down(queryInterface, Sequelize) {
    const table_name = envs.tables.login_sessions;
    await queryInterface.dropTable(table_name);
  },
};
