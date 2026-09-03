"use strict";

const { envs } = require("../../services/environment.service");
const table_name = envs.tables.category_master;

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table_name, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "0=Inactive, 1=Active",
      },
      isDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Soft delete flag",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table_name);
  },
};
