import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import QuestionnaireTemp from "../models/QuestionnaireTemp";
import { questionnaireSchema } from "../dto/questionnaire.dto";
import { Template } from "../types/template";
import { ICategory } from "../models/QuestionnaireTemp";

/**
 * @swagger
 * /api/template:
 *   post:
 *     summary: Admin creates a new questionnaire template
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *             properties:
 *               template:
 *                 type: object
 *                 required:
 *                   - name
 *                   - categories
 *                 properties:
 *                   name:
 *                     type: string
 *                   categories:
 *                     type: array
 *                     maxItems: 10
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - questions
 *                       properties:
 *                         name:
 *                           type: string
 *                         questions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             required:
 *                               - q
 *                               - choice
 *                               - qType
 *                               - required
 *                             properties:
 *                               q:
 *                                 type: string
 *                               choice:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               qType:
 *                                 type: string
 *                               required:
 *                                 type: boolean
 *                               answer:
 *                                 type: string
 *                         subCategories:
 *                           type: array
 *                           maxItems: 10
 *                           items:
 *                             type: object
 *                             required:
 *                               - name
 *                               - questions
 *                             properties:
 *                               name:
 *                                 type: string
 *                               questions:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   required:
 *                                     - q
 *                                     - choice
 *                                     - qType
 *                                     - required
 *                                   properties:
 *                                     q:
 *                                       type: string
 *                                     choice:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                     qType:
 *                                       type: string
 *                                     required:
 *                                       type: boolean
 *                                     answer:
 *                                       type: string
 *                               topics:
 *                                 type: array
 *                                 maxItems: 10
 *                                 items:
 *                                   type: object
 *                                   required:
 *                                     - name
 *                                     - questions
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                     questions:
 *                                       type: array
 *                                       items:
 *                                         type: object
 *                                         required:
 *                                           - q
 *                                           - choice
 *                                           - qType
 *                                           - required
 *                                         properties:
 *                                           q:
 *                                             type: string
 *                                           choice:
 *                                             type: array
 *                                             items:
 *                                               type: string
 *                                           qType:
 *                                             type: string
 *                                           required:
 *                                             type: boolean
 *                                           answer:
 *                                             type: string
 *     responses:
 *       201:
 *         description: Template created successfully and template object
 *       400:
 *         description: Invalid input or duplicate name
 *       500:
 *         description: Internal server/database error
 */
export const createTemplate = asyncHandler(
  async (req: Request<{}, {}, { template: Template }>, res: Response) => {
    const { template } = req.body;
    const trimmedName = template.name.trim();

    // 1. Validate Name using schema
    const result = questionnaireSchema.safeParse({ name: trimmedName });
    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      return res.status(400).json({ message: errors });
    }

    // 2. Check if template name already exists
    const existing = await QuestionnaireTemp.findOne({ name: trimmedName });
    if (existing) {
      throw new Error("שם השאלון כבר קיים");
    }

    // 3. Validate nested uniqueness constraints (in-memory)
    try {
      const catNames = new Set();
      for (const cat of template.categories) {
        const catName = cat.name.trim();
        if (catNames.has(catName))
          throw new Error(`כפילות שם קטגוריה: '${catName}'`);
        catNames.add(catName);

        if (cat.subCategories && cat.subCategories?.length > 10)
          throw new Error(`לקטגוריה: '${catName}' יש יותר מ10 תתי קטגוריות`);

        const subNames = new Set();
        for (const sub of cat.subCategories || []) {
          const subName = sub.name.trim();
          if (subNames.has(subName))
            throw new Error(`כפילויות שם תת קטגוריה: '${subName}'`);
          subNames.add(subName);

          if (sub.topics && sub.topics?.length > 10)
            throw new Error(`לתת הקטגוריה '${subName}' יש יותר מ10 נושאים`);

          const topicNames = new Set();
          for (const topic of sub.topics || []) {
            const topicName = topic.name.trim();
            if (topicNames.has(topicName))
              throw new Error(
                `כפילויות בתת קטגוריה '${subName}': תחת השם: '${topicName}'`,
              );
            topicNames.add(topicName);
          }
        }
      }
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    // 4. Create the embedded document
    try {
      const newTemplate = await QuestionnaireTemp.create({
        name: trimmedName,
        categories: template.categories,
      });

      return res.status(201).json(newTemplate);
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "שם השאלון כבר קיים במערכת" });
      }
      return res.status(500).json({
        message: err.message || "Failed to create questionnaire template",
      });
    }
  },
);

/**
 * @swagger
 * /api/template/{id}:
 *   get:
 *     summary: Admin get a questionnaire template by ID
 *     tags: [Template]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Template ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved template
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 template:
 *                   type: object
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await QuestionnaireTemp.findById(id).populate({
    path: "categories",
    populate: {
      path: "subCategory",
      populate: {
        path: "topic",
      },
    },
  });
  if (!template) {
    throw new Error("Template not found");
  }
  return res.status(200).json({ template });
});

/**
 * @swagger
 * /api/template/{id}:
 *   delete:
 *     summary: Admin deletes a questionnaire template by ID
 *     tags: [Template]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the template to delete
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Template deleted successfully
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
export const deleteTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await QuestionnaireTemp.findByIdAndDelete(id);
    return res.status(200).json({ message: "Template deleted successfully" });
  },
);

/**
 * @swagger
 * /api/template/{id}:
 *   put:
 *     summary: Admin updates an existing questionnaire template
 *     tags: [Template]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Questionnaire template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Validation or duplicate name error
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server/database error
 */
export const updateTemplate = asyncHandler(
  async (
    req: Request<{ id: string }, {}, { template: Template }>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { template } = req.body;
    const trimmedName = template.name.trim();

    // Validate schema-level name
    const result = questionnaireSchema.safeParse({ name: trimmedName });
    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      return res.status(400).json({ message: errors });
    }

    // Check if template exists
    const existing = await QuestionnaireTemp.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "שאלון לא קיים" });
    }

    // Ensure no duplicate template name (other than itself)
    const conflict = await QuestionnaireTemp.findOne({
      _id: { $ne: id },
      name: trimmedName,
    });
    if (conflict) {
      return res.status(400).json({ message: "שם השאלון כבר קיים במערכת" });
    }

    // Validate nested structure
    try {
      const catNames = new Set();
      for (const cat of template.categories) {
        const catName = cat.name.trim();
        if (catNames.has(catName))
          throw new Error(`כפילות שם קטגוריה: '${catName}'`);
        catNames.add(catName);

        if (cat.subCategories && cat.subCategories?.length > 10)
          throw new Error(`לקטגוריה: '${catName}' יש יותר מ10 תתי קטגוריות`);

        const subNames = new Set();
        for (const sub of cat.subCategories || []) {
          const subName = sub.name.trim();
          if (subNames.has(subName))
            throw new Error(`כפילויות שם תת קטגוריה: '${subName}'`);
          subNames.add(subName);

          if (sub.topics && sub.topics?.length > 10)
            throw new Error(`לתת הקטגוריה '${subName}' יש יותר מ10 נושאים`);

          const topicNames = new Set();
          for (const topic of sub.topics || []) {
            const topicName = topic.name.trim();
            if (topicNames.has(topicName))
              throw new Error(
                `כפילויות בתת קטגוריה '${subName}': תחת השם: '${topicName}'`,
              );
            topicNames.add(topicName);
          }
        }
      }
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    // Apply update
    existing.name = trimmedName;
    existing.categories = template.categories as ICategory[];

    try {
      const updated = await existing.save();
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({
        message: err.message || "Failed to update questionnaire template",
      });
    }
  },
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *         choice:
 *           type: array
 *           items:
 *             type: string
 *         qType:
 *           type: string
 *         required:
 *           type: boolean
 *         answer:
 *           type: string
 *         id:
 *           type: string

 *     Topic:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         id:
 *           type: string

 *     SubCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         topics:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Topic'
 *         id:
 *           type: string

 *     Category:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         subCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategory'
 *         id:
 *           type: string

 *     Template:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         id:
 *           type: string

 * /api/template:
 *   get:
 *     summary: Admin get all questionnaire templates (paginated)
 *     tags: [Template]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts at 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of templates per page
 *     responses:
 *       200:
 *         description: Successfully retrieved paginated templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of templates in the database
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 templates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Template'
 *       500:
 *         description: Internal server error
 */
export const getAllTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    const [templates, total] = await Promise.all([
      QuestionnaireTemp.find().skip(skip).limit(pageSize),
      QuestionnaireTemp.countDocuments(),
    ]);

    return res.status(200).json({
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      templates,
    });
  },
);

/**
 * @swagger
 * /api/template/search:
 *   get:
 *     summary: Admin search questionnaire templates by any name (template/category/subcategory/topic)
 *     tags: [Template]
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term to match against template, category, subcategory, or topic names (case-insensitive)
 *     responses:
 *       200:
 *         description: Successfully retrieved matching templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Template'
 *       400:
 *         description: Missing search value
 *       500:
 *         description: Internal server error
 */
export const searchByName = asyncHandler(
  async (req: Request, res: Response) => {
    const { value } = req.query;

    if (!value || typeof value !== "string") {
      return res.status(400).json({ message: "ערך לא תקין" });
    }

    const regex = new RegExp(value.trim(), "i");

    const templates = await QuestionnaireTemp.find({
      $or: [
        { name: regex },
        { "categories.name": regex },
        { "categories.subCategories.name": regex },
        { "categories.subCategories.topics.name": regex },
      ],
    });

    return res.status(200).json(templates);
  },
);
