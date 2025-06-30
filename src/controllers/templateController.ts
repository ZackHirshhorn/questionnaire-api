import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import QuestionnaireTemp from "../models/QuestionnaireTemp";
import { questionnaireSchema } from "../dto/questionnaire.dto";
import { Template } from "../types/template";

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

        if (cat.subCategories?.length > 10)
          throw new Error(`לקטגוריה: '${catName}' יש יותר מ10 תתי קטגוריות`);

        const subNames = new Set();
        for (const sub of cat.subCategories || []) {
          const subName = sub.name.trim();
          if (subNames.has(subName))
            throw new Error(`כפילויות שם תת קטגוריה: '${subName}'`);
          subNames.add(subName);

          if (sub.topics?.length > 10)
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
