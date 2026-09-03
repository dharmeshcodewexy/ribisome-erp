// External dependencies - Start
const router = require("express").Router({ mergeParams: true });
const { z } = require("zod");
// External dependencies - End

// Internal dependencies - Start
const AppError = require("../../../services/app-error.service");
const validateRequest = require("../../../services/schema-validator-service");
const { checkPermission } = require("../../../services/permission-middleware.service");
const { CategoryMaster } = require("../../../database/models");
// Internal dependencies - End

//  1. Define Zod Validation Schemas

const createCategoryMasterSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

const updateCategoryMasterSchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  description: z.string().optional(),
  status: z.union([z.literal(0), z.literal(1), z.literal("0"), z.literal("1")]).default(1).optional(),
  isDelete: z.union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((val) => val === true || val === "true")
    .default(false)
    .optional(),
});

//  2. Define Route Handlers

// Get all category master with pagination
router.get("/", checkPermission("read_category"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await CategoryMaster.findAndCountAll({
      offset,
      limit,
      attributes: ["id", "name", "description", "status", "created_at", "updated_at"],
      order: [["created_at", "DESC"]],
      where: {
        status:"1" || 1,
        isDelete: false
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Category master fetched successfully",
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

// Get single category master
router.get("/:id", checkPermission("read_category"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoryMaster = await CategoryMaster.findByPk(id, {
      attributes: ["id", "name", "description", "status", "created_at", "updated_at"],
    });

    if (!categoryMaster) {
      return next(new AppError(404, "Category master not found"));
    }

    return res.status(200).json({
      status: "success",
      message: "Category master fetched successfully",
      data: categoryMaster,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Create category master
router.post("/", checkPermission("create_category"), validateRequest(createCategoryMasterSchema), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const categoryMaster = await CategoryMaster.create({
      name,
      description,
      status: "1",
    });

    return res.status(200).json({
      status: "success",
      message: "Category master created successfully",
      data: categoryMaster,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// Update category master
router.put("/:id", checkPermission("update_category"), validateRequest(updateCategoryMasterSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, isDelete } = req.body;

    const categoryMaster = await CategoryMaster.findByPk(id);
    if (!categoryMaster) {
      return next(new AppError(404, "Category master not found"));
    }

    await categoryMaster.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(isDelete !== undefined && { isDelete }),
    });

    return res.status(200).json({
      status: "success",
      message: "Category master updated successfully",
      data: categoryMaster,
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

// delete category master soft delete
router.delete("/:id", checkPermission("delete_category"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoryMaster = await CategoryMaster.findByPk(id);
    if (!categoryMaster) {
      return next(new AppError(404, "Category master not found"));
    }

    await categoryMaster.update({
      isDelete: true,
    });

    return res.status(200).json({
      status: "success",
      message: "Category master deleted successfully",
    });
  } catch (error) {
    return next(new AppError(422, error?.errors?.[0]?.message || error.message));
  }
});

module.exports = router;