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
    const template = await QuestionnaireTemp.findById(templateId);
    if (!template) {
      throw new Error("השאלון לא קיים");
    }
    const questionnaire = await Questionnaire.create({
      templateId,
      template,
      isComplete: false,
    });
  },
);

/**
 * @swagger
 * /api/questionnaire/{qId}:
 *   put:
 *     summary: Update an existing questionnaire by ID
 *     tags:
 *       - Questionnaire
 *     parameters:
 *       - in: path
 *         name: qId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the questionnaire to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ansQuestionnaire:
 *                 type: object
 *                 required:
 *                   - isComplete
 *                   - template
 *                 properties:
 *                   isComplete:
 *                     type: boolean
 *                     description: Whether the questionnaire is complete
 *                   userName:
 *                     type: string
 *                   userEmail:
 *                     type: string
 *                   userPhone:
 *                     type: string
 *                   template:
 *                     $ref: '#/components/schemas/QuestionnaireTemplate'
 *     responses:
 *       200:
 *         description: The updated questionnaire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Questionnaire'
 *       404:
 *         description: Questionnaire not found
 *       500:
 *         description: Internal server error
 */
export const updateQuestionnaire = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { qId } = req.params;
    const { ansQuestionnaire } = req.body;

    const questionnaire = await Questionnaire.findById(qId);
    if (!questionnaire) {
      throw new Error("שאלון לא קיים");
    }
    if (req.user) {
      questionnaire.user = req.user.id;
      questionnaire.userName = req.user.name;
      questionnaire.userEmail = req.user.email;
      questionnaire.userPhone = req.user.phone;
      questionnaire.isComplete = ansQuestionnaire.isComplete;
      questionnaire.template = ansQuestionnaire.template;
      const updateQuestionnaire = await questionnaire.save();
      return res.status(200).json(updateQuestionnaire);
    } else {
      questionnaire.userName = ansQuestionnaire.userName || null;
      questionnaire.userEmail = ansQuestionnaire.userEmail || null;
      questionnaire.userPhone = ansQuestionnaire.userPhone || null;
      questionnaire.isComplete = ansQuestionnaire.isComplete;
      questionnaire.template = ansQuestionnaire.template;
      const updateQuestionnaire = await questionnaire.save();
      return res.status(200).json(updateQuestionnaire);
    }
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
      const questionnaires = await Questionnaire.find({ user: req.user.id });
      return res.status(200).json(questionnaires);
    } else {
      throw new Error("המשתמש לא קיים");
    }
  },
);
