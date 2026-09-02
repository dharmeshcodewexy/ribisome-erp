"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert roles
    const roles = await queryInterface.bulkInsert(
      "roles",
      [
        {
          name: "superadmin",
          description: "Super administrator with full system access",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "admin",
          description: "Administrator with limited management capabilities",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "staff",
          description: "Staff member with restricted access",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // Insert permissions
    const permissions = await queryInterface.bulkInsert(
      "permissions",
      [
        // User management permissions
        {
          name: "create_user",
          description: "Create new users",
          module: "users",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "read_user",
          description: "View user details",
          module: "users",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "update_user",
          description: "Edit user information",
          module: "users",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "delete_user",
          description: "Delete users",
          module: "users",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Role management permissions
        {
          name: "manage_roles",
          description: "Create, update, and delete roles",
          module: "roles",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "assign_roles",
          description: "Assign roles to users",
          module: "roles",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Permission management
        {
          name: "manage_permissions",
          description: "Create, update, and delete permissions",
          module: "permissions",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Reports and analytics
        {
          name: "view_reports",
          description: "View system reports and analytics",
          module: "reports",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "export_reports",
          description: "Export reports to file formats",
          module: "reports",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },

        // System settings
        {
          name: "manage_settings",
          description: "Manage system-wide settings",
          module: "settings",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "view_logs",
          description: "View system logs",
          module: "logs",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // Assign all permissions to superadmin
    const superadminPermissions = permissions.map((perm, index) => ({
      role_id: 1, // superadmin
      permission_id: index + 1,
      created_at: new Date(),
    }));

    // Assign admin permissions (everything except manage_roles and manage_permissions)
    const adminPermissions = [1, 2, 3, 7, 8, 9, 10].map((permId) => ({
      role_id: 2, // admin
      permission_id: permId,
      created_at: new Date(),
    }));

    // Assign staff permissions (read and view only)
    const staffPermissions = [2, 7, 10].map((permId) => ({
      role_id: 3, // staff
      permission_id: permId,
      created_at: new Date(),
    }));

    const allRolePermissions = [
      ...superadminPermissions,
      ...adminPermissions,
      ...staffPermissions,
    ];

    await queryInterface.bulkInsert("role_permissions", allRolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_permissions", null, {});
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("roles", null, {});
  },
};
