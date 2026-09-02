"use strict";
const { Model } = require("sequelize");
const { envs } = require("../../services/environment.service");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate({ Permission }) {
      // Permissions assigned to this role
      this.belongsToMany(Permission, {
        through: envs.tables.role_permissions,
        foreignKey: "role_id",
        otherKey: "permission_id",
        as: "permissions",
      });
    }

    toJSON() {
      return Object.assign({}, this.get());
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: "e.g., superadmin, admin, staff",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: "Role",
      tableName: envs.tables.roles,
      timestamps: true,
      underscored: true,
    }
  );

  return Role;
};
