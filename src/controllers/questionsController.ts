import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import QuestionsCol from "../models/QuestionsCol";
import { questionColSchema } from "../dto/questionCol";

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Admin Create a new question collection
 *     tags:
 *       - Questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - colName
 *               - questions
 *             properties:
 *               colName:
 *                 type: string
 *                 example: Customer Feedback Set
 *               questions:
 *                 type: array
 *                 description: List of question objects
 *                 items:
 *                   type: object
 *                   properties:
 *                     q:
 *                       type: string
 *                       example: How satisfied are you with the service?
 *                     choice:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
 *                     qType:
 *                       type: string
 *                       example: multiple-choice
 *                     required:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       201:
 *         description: Question collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 60e44d556ad3e63f8c05d515
 *                 name:
 *                   type: string
 *                   example: Customer Feedback Set
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       q:
 *                         type: string
 *                       choice:
 *                         type: array
 *                         items:
 *                           type: string
 *                       qType:
 *                         type: string
 *                       required:
 *                         type: boolean
 *       400:
 *         description: Validation error (invalid name or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Collection name is required"]
 *       409:
 *         description: Question collection with the same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: שם אסופת השאלות כבר קיים
 *       500:
 *         description: Server error occurred while creating collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const createQuestionsCol = asyncHandler(
  async (req: Request, res: Response) => {
    const { colName, questions } = req.body;
    const result = questionColSchema.safeParse({ name: colName.trim() });
    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      return res.status(400).json({ message: errors });
    }
    const existing = await QuestionsCol.findOne({ name: colName.trim() });
    if (existing) {
      throw new Error("שם אסופת השאלות כבר קיים");
    }
    const newQuestionCol = await QuestionsCol.create({
      name: colName.trim(),
      questions,
    });
    res.status(201).json(newQuestionCol);
  },
);

/**
 * @swagger
 * /api/questions/search:
 *   get:
 *     summary: Admin Search question collections by name
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial or full name of the question collection to search
 *         example: Feedback
 *     responses:
 *       200:
 *         description: List of matching question collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64cda2a7e0ef1c02a9a055e3
 *                   name:
 *                     type: string
 *                     example: Customer Feedback Set
 *       400:
 *         description: Invalid or missing search value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ערך לא תקין
 *       500:
 *         description: Server error occurred during search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const searchByName = asyncHandler(
  async (req: Request, res: Response) => {
    const { value } = req.query;

    if (!value || typeof value !== "string") {
      return res.status(400).json({ message: "ערך לא תקין" });
    }

    const regex = new RegExp(value.trim(), "i");
    const questionCols = await QuestionsCol.find({
      name: regex,
    }).select("name _id");
    return res.status(200).json(questionCols);
  },
);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Admin Get a specific question collection by ID
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question collection
 *         example: 64cda2a7e0ef1c02a9a055e3
 *     responses:
 *       200:
 *         description: Question collection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 64cda2a7e0ef1c02a9a055e3
 *                 name:
 *                   type: string
 *                   example: Customer Feedback Set
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       q:
 *                         type: string
 *                         example: How satisfied are you with our service?
 *                       choice:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
 *                       qType:
 *                         type: string
 *                         example: multiple-choice
 *                       required:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Question collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: האסופה לא נמצאה
 *       500:
 *         description: Server error occurred while fetching the collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const getQuestionsColById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const questionsCol = await QuestionsCol.findById(id);
    res.status(200).json(questionsCol);
  },
);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Admin Update an existing question collection
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question collection to update
 *         example: 64cda2a7e0ef1c02a9a055e3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               colName:
 *                 type: string
 *                 example: Updated Feedback Set
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     q:
 *                       type: string
 *                       example: How was your experience with the new service?
 *                     choice:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Excellent", "Good", "Average", "Poor"]
 *                     qType:
 *                       type: string
 *                       example: multiple-choice
 *                     required:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Question collection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       q:
 *                         type: string
 *                       choice:
 *                         type: array
 *                         items:
 *                           type: string
 *                       qType:
 *                         type: string
 *                       required:
 *                         type: boolean
 *       404:
 *         description: Question collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: אסופת שאלות זו לא קיימת
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Invalid colName", "Question format is incorrect"]
 *       500:
 *         description: Server error during update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const updatedQuestionsCol = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { colName, questions } = req.body;

    const existing = await QuestionsCol.findById(id);
    if (!existing) throw new Error("אסופת שאלות זו לא קיימת");

    existing.name = colName ? colName.trim() : existing.name;
    existing.questions = questions ? questions : existing.questions;

    const updated = await existing.save();

    res.status(200).json(updated);
  },
);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Admin Delete a question collection by ID
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question collection to delete
 *         example: 64cda2a7e0ef1c02a9a055e3
 *     responses:
 *       200:
 *         description: Question collection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: אסופת השאלות נמחקה בהצלחה
 *       404:
 *         description: Question collection not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: אסופת השאלות לא נמצאה
 *       500:
 *         description: Server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const deleteQuestionsCol = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await QuestionsCol.findByIdAndDelete(id);
    res.status(200).json({ message: "אסופת השאלות נמחקה בהצלחה" });
  },
);
