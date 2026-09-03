"use strict";
const { Model } = require("sequelize");
const { envs } = require("../../services/environment.service");

module.exports = (sequelize, DataTypes) => {
  class CategoryMaster extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    toJSON() {
      return Object.assign({}, this.get());
    }
  }

  CategoryMaster.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.SMALLINT,
        defaultValue: 1,
        comment: "0=Inactive, 1=Active",
      },
      isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "isDelete",
        comment: "Soft delete flag",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CategoryMaster",
      tableName: envs.tables.category_master,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CategoryMaster;
};
