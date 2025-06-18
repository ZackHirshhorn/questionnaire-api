import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import generateToken from "../utils/generateToken";
import User from "../models/User";
import { registerSchema, loginSchema } from "../DTO/users.dto";

// @desc    Register a new user
// @route   POST /api/auth
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const result = registerSchema.safeParse({
    email: email.trim(),
    password: password.trim(),
    name: name.trim(),
    phone: phone.trim(),
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
    throw new Error("User already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password: password.trim(),
    phone: phone.trim(),
  });

  if (user) {
    generateToken(res, user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } else {
    res.status(500);
    throw new Error("Database error");
  }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = loginSchema.safeParse({
    email: email.trim(),
    password: password.trim(),
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
      phone: user.phone,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};
