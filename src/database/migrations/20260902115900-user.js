"use strict";

const { envs } = require("../../services/environment.service");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table_name = envs.tables.users;

    await queryInterface.createTable(table_name, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fullname: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      profile_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      user_code: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      status: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: "0-pending, 1-active, 2-inactive, 3-deleted",
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
    await queryInterface.addIndex(table_name, ["email"]);
    await queryInterface.addIndex(table_name, ["role_id"]);
    await queryInterface.addIndex(table_name, ["status"]);
  },

  async down(queryInterface, Sequelize) {
    const table_name = envs.tables.users;
    await queryInterface.dropTable(table_name);
  },
};
