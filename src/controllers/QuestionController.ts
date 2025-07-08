import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import QuestionsCol from "../models/QuestionsCol";
import { questionColSchema } from "../dto/questionCol";

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

export const searchByNameList = asyncHandler(
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

export const getQuestionsColsById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const questionsCol = await QuestionsCol.findById(id);
    res.status(200).json(questionsCol);
  },
);

export const updatedQuestionsCol = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { colName, questions } = req.body;

    const existing = await QuestionsCol.findById(id);
    if (!existing) throw new Error("אסופת שאלו זו לא קיימת");

    existing.name = colName ? colName.trim() : existing.name;
    existing.questions = questions ? questions : existing.questions;

    const updated = await existing.save();

    res.status(200).json(updated);
  },
);

export const deleteQuestionsCol = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await QuestionsCol.findByIdAndDelete(id);
    res.status(200).json({ message: "אסופת השאלות נמחקה בהצלחה" });
  },
);
