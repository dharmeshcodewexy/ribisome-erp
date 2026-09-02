"use strict";

const { envs } = require("../../services/environment.service");
const table_name = envs.tables.permissions;

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table_name, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
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

    await queryInterface.addIndex("permissions", ["name"]);
    await queryInterface.addIndex("permissions", ["module"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(table_name);
  },
};
