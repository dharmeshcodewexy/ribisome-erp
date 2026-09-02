"use strict";
const { Model } = require("sequelize");
const { envs } = require("../../services/environment.service");

module.exports = (sequelize, DataTypes) => {
  class LoginSession extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: "user_id", as: "user" });
    }

    toJSON() {
      return Object.assign({}, this.get());
    }
  }

  LoginSession.init(
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
          model: envs.tables.users,
          key: "id",
        },
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "logged_out", "expired"),
        defaultValue: "active",
      },
      logout_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "LoginSession",
      tableName: envs.tables.login_sessions,
      timestamps: true,
      underscored: true,
    }
  );

  return LoginSession;
};
