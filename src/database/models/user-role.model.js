"use strict";
const { Model } = require("sequelize");
const { envs } = require("../../services/environment.service");

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate({ User, Role }) {
      this.belongsTo(User, { foreignKey: "user_id", as: "user" });
      this.belongsTo(Role, { foreignKey: "role_id", as: "role" });
    }

    toJSON() {
      return Object.assign({}, this.get());
    }
  }

  UserRole.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "User ID of the admin who assigned this role",
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "User's primary role for token generation",
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
      modelName: "UserRole",
      tableName: envs.tables.user_roles,
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id", "role_id"], unique: true },
        { fields: ["user_id"] },
        { fields: ["role_id"] },
      ],
    }
  );

  return UserRole;
};
