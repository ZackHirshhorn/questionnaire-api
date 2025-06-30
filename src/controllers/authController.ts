import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import generateToken from "../utils/generateToken";
import User from "../models/User";
import { registerSchema, loginSchema } from "../dto/users.dto";

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully, cookie set and user json
 *         headers:
 *           set-cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid input | User already exists
 *       500:
 *         description: Database error
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = registerSchema.safeParse({
    email: email.trim() || "",
    password: password.trim() || "",
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

  const userExists = await User.findOne({ email: email.trim() });

  if (userExists) {
    res.status(400);
    throw new Error("האימייל כבר קיים במערכת");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password: password.trim(),
  });

  if (user) {
    generateToken(res, user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(500);
    throw new Error("Database error");
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in, JWT cookie set
 *         headers:
 *           set-cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid input or user not found
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = loginSchema.safeParse({
    email: email.trim() || "",
    password: password.trim() || "",
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.errors) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const user = await User.findOne({ email: email.trim() });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("איימייל או סיסמא לא תקינים");
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User successfully logout and clear cookie
 *       400:
 *         description: Invalid input | User not found
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "ההתנקות בוצעה בהצלחה" });
};
