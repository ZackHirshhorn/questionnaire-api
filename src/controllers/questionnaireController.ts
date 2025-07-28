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

/**
 * @swagger
 * /api/questionnaire/{id}:
 *   get:
 *     summary: Get a specific questionnaire by ID
 *     tags:
 *       - Questionnaire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the questionnaire to retrieve
 *         example: 64cdf1234ab56c78de90f123
 *     responses:
 *       200:
 *         description: Questionnaire retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 64cdf1234ab56c78de90f123
 *                 name:
 *                   type: string
 *                   example: Customer Satisfaction Survey
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Service Quality
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["How would you rate our service?", "Was our staff helpful?"]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-20T14:30:00Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-25T10:00:00Z
 *       404:
 *         description: Questionnaire not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: שאלון לא קיים
 *       500:
 *         description: Server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const getQuestionnairesById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      throw new Error("שאלון לא קיים");
    }
    return res.status(200).json(questionnaire);
  },
);

/**
 * @swagger
 * /api/questionnaire/{id}/answer/auth:
 *   put:
 *     summary: Update a questionnaire by the authenticated user
 *     description: Saves answers, phone number, and completion status for a questionnaire, linking it to the authenticated user.
 *     tags:
 *       - Questionnaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the questionnaire to update
 *         example: 64cdf1234ab56c78de90f123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ansTemplate:
 *                 type: object
 *                 description: The updated answer template
 *                 example:
 *                   categories:
 *                     - name: Service
 *                       questions:
 *                         - q: How was the experience?
 *                           answer: Great
 *               uPhone:
 *                 type: string
 *                 description: The phone number of the user
 *                 example: "+972501234567"
 *               isComplete:
 *                 type: boolean
 *                 description: Whether the questionnaire is marked complete
 *                 example: true
 *     responses:
 *       200:
 *         description: Questionnaire updated successfully (no content returned)
 *       404:
 *         description: Questionnaire not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: שאלון לא קיים
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error during questionnaire update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const updateByAuthUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { ansTemplate, uPhone, isComplete } = req.body;
    const questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      throw new Error("שאלון לא קיים");
    }
    questionnaire.user = req.user ? req.user.id : undefined;
    questionnaire.userName = req.user ? req.user.name : undefined;
    questionnaire.userEmail = req.user ? req.user.email : undefined;
    questionnaire.template = ansTemplate;
    questionnaire.userPhone = uPhone || null;
    questionnaire.isComplete = isComplete || questionnaire.isComplete;
    const saved = await questionnaire.save();
    return res.status(200).json(saved);
  },
);

/**
 * @swagger
 * /api/questionnaire/{id}/answer:
 *   put:
 *     summary: Update a questionnaire
 *     tags:
 *       - Questionnaire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the questionnaire to update
 *         example: 64cdf1234ab56c78de90f123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uName:
 *                 type: string
 *                 nullable: true
 *                 example: "John Doe"
 *               uEmail:
 *                 type: string
 *                 nullable: true
 *                 format: email
 *                 example: "john.doe@example.com"
 *               uPhone:
 *                 type: string
 *                 nullable: true
 *                 example: "+972501234567"
 *               isComplete:
 *                 type: boolean
 *                 example: true
 *               ansTemplate:
 *                 type: object
 *                 description: The answer structure with categories and questions
 *                 example:
 *                   categories:
 *                     - name: Service Quality
 *                       questions:
 *                         - q: "How would you rate the service?"
 *                           answer: "Excellent"
 *     responses:
 *       200:
 *         description: Questionnaire updated successfully
 *       404:
 *         description: Questionnaire not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: שאלון לא קיים
 *       400:
 *         description: Invalid request body or parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: בקשה לא תקינה
 *       500:
 *         description: Server error occurred during questionnaire update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const updateQuestionnaire = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ansTemplate, uName, uEmail, uPhone, isComplete } = req.body;
    const questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      throw new Error("שאלון לא קיים");
    }
    questionnaire.userName = uName || null;
    questionnaire.userEmail = uEmail || null;
    questionnaire.template = ansTemplate;
    questionnaire.userPhone = uPhone || null;
    questionnaire.isComplete = isComplete || questionnaire.isComplete;
    await questionnaire.save();
    return res.status(200);
  },
);
