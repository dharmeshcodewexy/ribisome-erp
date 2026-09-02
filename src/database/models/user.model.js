const { Model, DATEONLY } = require("sequelize");
const { envs } = require("../../services/environment.service");
const { providers } = require("../../services/providers.service");

const PROTECTED_ATTRIBUTES = ["password"];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Role }) {
      // RBAC: User has many roles through the user_roles junction table
      this.belongsToMany(Role, {
        through: envs.tables.user_roles,
        foreignKey: "user_id",
        otherKey: "role_id",
        as: "roles",
      });

      // Optional: Direct access to UserRole junction records if needed
      // Note: Cannot use 'user_roles' alias since belongsToMany already creates it internally
      // Uncomment if you need direct junction table access with a different name:
      // this.hasMany(UserRole, { foreignKey: "user_id", as: "role_assignments" });
    }

    toJSON() {
      let attributes = Object.assign({}, this.get());
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a];
      }
      const roleObj = providers.account_roles.find((r) => r.role_id === attributes.role_id);
      if (roleObj) {
        attributes.role = roleObj.name;
      }
      return attributes;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fullname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      profile_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      user_code: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      status: {
        // 0- pending, 1- active/approved, 2- inactive/rejected, 3-disable/delete
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      underscored: false,
      tableName: envs.tables.users,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return User;
};
