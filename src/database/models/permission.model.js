"use strict";
const { Model } = require("sequelize");
const { envs } = require("../../services/environment.service");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate({ Role }) {
      this.belongsToMany(Role, {
        through: envs.tables.role_permissions,
        foreignKey: "permission_id",
        otherKey: "role_id",
        as: "roles",
      });
    }

    toJSON() {
      return Object.assign({}, this.get());
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "e.g., create_user, edit_user, delete_user, view_reports",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "e.g., users, reports, settings",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
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
      modelName: "Permission",
      tableName: envs.tables.permissions,
      timestamps: true,
      underscored: true,
    }
  );

  return Permission;
};
