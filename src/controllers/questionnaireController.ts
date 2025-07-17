import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import Questionnaire from "../models/Questionnaire";
import QuestionnaireTemp from "../models/QuestionnaireTemp";
import { IUser } from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * @swagger
 * /api/questionnaire:
 *   post:
 *     summary: Create a new questionnaire based on a template.
 *     tags:
 *       - Questionnaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: ID of the questionnaire template
 *     responses:
 *       201:
 *         description: Questionnaire successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 templateId:
 *                   type: string
 *                 isComplete:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
export const createQuestionnaire = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId } = req.body;
    const template = await QuestionnaireTemp.findById(templateId)
      .populate({
        path: "categories.questions",
        model: "QuestionsCol",
        populate: {
          path: "questions",
          model: "Question",
        },
      })
      .populate({
        path: "categories.subCategories.questions",
        model: "QuestionsCol",
        populate: {
          path: "questions",
          model: "Question",
        },
      })
      .populate({
        path: "categories.subCategories.topics.questions",
        model: "QuestionsCol",
        populate: {
          path: "questions",
          model: "Question",
        },
      });
    if (!template) {
      throw new Error("השאלון לא קיים");
    }
    // Map QuestionsCol => raw questions array
    const transformedTemplate = JSON.parse(JSON.stringify(template)); // shallow clone
    for (const category of transformedTemplate.categories) {
      category.questions = category.questions.flatMap(
        (qc: any) => qc.questions || [],
      );
      for (const sub of category.subCategories || []) {
        sub.questions = sub.questions.flatMap((qc: any) => qc.questions || []);
        for (const topic of sub.topics || []) {
          topic.questions = topic.questions.flatMap(
            (qc: any) => qc.questions || [],
          );
        }
      }
    }
    const questionnaire = await Questionnaire.create({
      templateId,
      template: transformedTemplate,
      isComplete: false,
    });
    return res.status(201).json(questionnaire);
  },
);

/**
 * @swagger
 * /api/questionnaire/user/{userId}:
 *   get:
 *     summary: Get questionnaires for a specific user or the authenticated user.
 *     tags:
 *       - Questionnaire
 *     responses:
 *       200:
 *         description: List of questionnaires for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   templateId:
 *                     type: string
 *                   user:
 *                     type: object
 *                   userPhone:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   userEmail:
 *                     type: string
 *                   isComplete:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getQuestionnairesByUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      const questionnaires = await Questionnaire.find({
        user: req.user.id,
      }).select("name _id");
      return res.status(200).json(questionnaires);
    } else {
      throw new Error("המשתמש לא קיים");
    }
  },
);

export const updateByAuthUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      throw new Error("שאלון לא קיים");
    }
  },
);
