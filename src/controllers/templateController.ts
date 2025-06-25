import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import QuestionnaireTemp from "../models/QuestionnaireTemp";
import { questionnaireSchema } from "../dto/questionnaire.dto";
import { Template } from "../types/template";
import Topic from "../models/Topic";
import SubCategory from "../models/SubCategory";
import Category from "../models/Category";

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
 *                         subCategory:
 *                           type: object
 *                           required:
 *                             - name
 *                             - questions
 *                           properties:
 *                             name:
 *                               type: string
 *                             questions:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 required:
 *                                   - q
 *                                   - choice
 *                                   - qType
 *                                   - required
 *                                 properties:
 *                                   q:
 *                                     type: string
 *                                   choice:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *                                   qType:
 *                                     type: string
 *                                   required:
 *                                     type: boolean
 *                                   answer:
 *                                     type: string
 *                             topic:
 *                               type: object
 *                               required:
 *                                 - name
 *                                 - questions
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 questions:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     required:
 *                                       - q
 *                                       - choice
 *                                       - qType
 *                                       - required
 *                                     properties:
 *                                       q:
 *                                         type: string
 *                                       choice:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       qType:
 *                                         type: string
 *                                       required:
 *                                         type: boolean
 *                                       answer:
 *                                         type: string
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 template:
 *                   type: object
 *       400:
 *         description: Invalid input or duplicate name
 *       500:
 *         description: Internal server/database error
 */
export const createTemplate = asyncHandler(
  async (req: Request<{}, {}, { template: Template }>, res: Response) => {
    const { template } = req.body;
    const nameTrimmed = template.name.trim();

    // Validate name
    const result = questionnaireSchema.safeParse({ name: nameTrimmed });
    if (!result.success) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({ message: errors });
    }

    // Check if questionnaire name already exists
    const existingTemplate = await QuestionnaireTemp.findOne({
      name: nameTrimmed,
    });
    if (existingTemplate) {
      return res
        .status(400)
        .json({ message: "Questionnaire's name already exists" });
    }

    // Process all categories
    const categoryPromises = template.categories.map(async (cat) => {
      let subCategoryId: string | undefined;

      // Handle SubCategory if exists
      if (cat.subCategory) {
        const {
          name: subName,
          questions: subQuestions,
          topic,
        } = cat.subCategory;

        let topicId: string | undefined;

        // Handle Topic if exists
        if (topic) {
          const existingTopic = await Topic.findOne({
            name: topic.name.trim(),
          });
          if (existingTopic) {
            throw new Error(`Topic "${topic.name.trim()}" already exists`);
          }

          const newTopic = await Topic.create({
            name: topic.name.trim(),
            questions: topic.questions,
          });
          topicId = newTopic.id;
        }

        const existingSubCategory = await SubCategory.findOne({
          name: subName.trim(),
        });
        if (existingSubCategory) {
          throw new Error(`Sub-category "${subName.trim()}" already exists`);
        }

        const newSubCategory = await SubCategory.create({
          name: subName.trim(),
          questions: subQuestions,
          topic: topicId,
        });

        subCategoryId = newSubCategory.id;
      }

      // Create Category
      const existingCategory = await Category.findOne({
        name: cat.name.trim(),
      });
      if (existingCategory) {
        throw new Error(`Category "${cat.name.trim()}" already exists`);
      }

      const newCategory = await Category.create({
        name: cat.name.trim(),
        questions: cat.questions,
        subCategory: subCategoryId,
      });

      return newCategory.id;
    });

    // Execute all category creation in parallel
    let categoryIds: string[];
    try {
      categoryIds = await Promise.all(categoryPromises);
    } catch (err: any) {
      return res
        .status(400)
        .json({ message: err.message || "Failed to create categories" });
    }

    // Create final questionnaire template
    const newTemplate = await QuestionnaireTemp.create({
      name: nameTrimmed,
      categories: categoryIds,
    });

    const populatedTemplate = await QuestionnaireTemp.findById(
      newTemplate.id,
    ).populate({
      path: "categories",
      populate: {
        path: "subCategory",
        populate: {
          path: "topic",
        },
      },
    });

    return res.status(201).json(populatedTemplate);
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
 *   put:
 *     summary: Admin updates a questionnaire template including nested categories
 *     tags: [Template]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the template to update
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
 *                   - _id
 *                   - name
 *                   - categories
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - _id
 *                         - name
 *                         - questions
 *                       properties:
 *                         _id:
 *                           type: string
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
 *                         subCategory:
 *                           type: object
 *                           required:
 *                             - _id
 *                             - name
 *                             - questions
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             questions:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 required:
 *                                   - q
 *                                   - choice
 *                                   - qType
 *                                   - required
 *                                 properties:
 *                                   q:
 *                                     type: string
 *                                   choice:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *                                   qType:
 *                                     type: string
 *                                   required:
 *                                     type: boolean
 *                                   answer:
 *                                     type: string
 *                             topic:
 *                               type: object
 *                               required:
 *                                 - _id
 *                                 - name
 *                                 - questions
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 questions:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     required:
 *                                       - q
 *                                       - choice
 *                                       - qType
 *                                       - required
 *                                     properties:
 *                                       q:
 *                                         type: string
 *                                       choice:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       qType:
 *                                         type: string
 *                                       required:
 *                                         type: boolean
 *                                       answer:
 *                                         type: string
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     # Further nested response can be defined as needed
 *       400:
 *         description: Invalid input or update failed
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

    let existingTemplate = await QuestionnaireTemp.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    const nameTrimmed = template.name.trim();
    // Validate name
    const result = questionnaireSchema.safeParse({ name: nameTrimmed });
    if (!result.success) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({ message: errors });
    }

    // Check if questionnaire name already exists
    existingTemplate = null;
    existingTemplate = await QuestionnaireTemp.findOne({
      name: nameTrimmed,
    });
    if (existingTemplate && existingTemplate.id !== id) {
      return res
        .status(400)
        .json({ message: "Questionnaire's name already exists" });
    }

    const updatePromises = template.categories.map(async (cat) => {
      // Update Category
      await Category.findByIdAndUpdate(
        cat.id,
        {
          name: cat.name.trim(),
          questions: cat.questions,
        },
        { new: true },
      );

      if (cat.subCategory) {
        const sub = cat.subCategory;

        // Update SubCategory
        await SubCategory.findByIdAndUpdate(
          sub.id,
          {
            name: sub.name.trim(),
            questions: sub.questions,
          },
          { new: true },
        );

        if (sub.topic) {
          const topic = sub.topic;

          // Update Topic
          await Topic.findByIdAndUpdate(
            topic.id,
            {
              name: topic.name.trim(),
              questions: topic.questions,
            },
            { new: true },
          );
        }
      }
    });

    try {
      await Promise.all(updatePromises);
    } catch (err: any) {
      return res.status(400).json({
        message: err.message || "Failed to update template structure",
      });
    }

    const updatedTemplate = await QuestionnaireTemp.findById(id).populate({
      path: "categories",
      populate: {
        path: "subCategory",
        populate: {
          path: "topic",
        },
      },
    });

    return res.status(200).json(updatedTemplate);
  },
);

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

/** --------------------  functions --------------------------  */

const createNewTemplate = async (template: Template) => {
  try {
  } catch (error) {
    throw error;
  }
};
