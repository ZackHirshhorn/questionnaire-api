import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import School from "../models/School";
import { schoolSchema } from "../dto/school.dto";

/**
 * @swagger
 * /api/school:
 *   post:
 *     summary: Admin create a new school
 *     tags: [School]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: School created successfully and school json
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid input | School already exists
 *       500:
 *         description: Database error
 */
export const createSchool = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;

    const result = schoolSchema.safeParse({
      name: name.trim() || "",
    });
    if (!result.success) {
      const errors = [];
      for (const error of result.error.errors) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }
    const exists = await School.findOne({ name: name.trim() });
    if (exists) {
      res.status(400).json({ message: "School already exists" });
      return;
    }
    const school = await School.create({
      name: name.trim(),
    });
    res.status(201).json({ school });
  },
);
