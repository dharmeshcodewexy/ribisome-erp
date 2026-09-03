// External dependencies - Start
const router = require("express").Router({ mergeParams: true });
const { z } = require("zod");
const { hashSync } = require("bcryptjs");
// External dependencies - End

// Internal dependencies - Start
const AppError = require("../../../services/app-error.service");
const validateRequest = require("../../../services/schema-validator-service");
const { checkPermission } = require("../../../services/permission-middleware.service");
const { User, UserRole, Role } = require("../../../database/models");
// Internal dependencies - End

// 1. Define Zod Validation Schemas
const createUserSchema = z.object({
  fullname: z.string({ required_error: "Full name is required" }).min(1, "Full name cannot be empty"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  phone: z.string().optional(),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
  role_id: z.number({ required_error: "Role is required" }).positive("Invalid role"),
});

const updateUserSchema = z.object({
  fullname: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  status: z.enum(["0", "1", "2", "3"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role_id: z.number().positive("Invalid role").optional(),
});

// 2. Define Route Handlers

// Get all users with pagination
router.get("/", checkPermission("read_user"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: UserRole,
          as: "user_roles",
          include: {
            model: Role,
            as: "role",
            attributes: ["id", "name"],
          },
        },
      ],
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Get single user
router.get("/:id", checkPermission("read_user"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: UserRole,
          as: "user_roles",
          include: {
            model: Role,
            as: "role",
            attributes: ["id", "name", "description"],
          },
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Create new user
router.post("/", checkPermission("create_user"), validateRequest(createUserSchema), async (req, res, next) => {
  try {
    const { fullname, email, phone, password, role_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError(409, "User with this email already exists"));
    }

    const hashedPassword = hashSync(password, 10);

    // Create user
    const newUser = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword, // Hash this in production
      status: 1,
    });

    // Assign role
    await UserRole.create({
      user_id: newUser.id,
      role_id,
      assigned_at: new Date(),
      assigned_by: res.locals.login_id,
      is_primary: true,
    });

    const userWithRole = await User.findByPk(newUser.id, {
      include: {
        model: UserRole,
        as: "user_roles",
        include: {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      },
      attributes: { exclude: ["password"] },
    });

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: userWithRole,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Update user
router.put("/:id", checkPermission("update_user"), validateRequest(updateUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullname, email, phone, status, password, role_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    let hashedPassword;
    if (password) {
      hashedPassword = hashSync(password, 10);
    }

    // Update user
    await user.update({
      ...(fullname && { fullname }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(status && { status }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(role_id && { role_id }),
    });

    if (role_id) {
      await UserRole.update({ role_id }, { where: { user_id: id, is_primary: true } });
    }

    const updatedUser = await User.findByPk(id, {
      include: {
        model: UserRole,
        as: "user_roles",
        include: {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      },
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Delete user
router.delete("/:id", checkPermission("delete_user"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    // Delete user roles first (due to foreign key constraints)
    await UserRole.destroy({ where: { user_id: id } });

    // Delete user
    await user.destroy();

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: { id },
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

module.exports = router;
