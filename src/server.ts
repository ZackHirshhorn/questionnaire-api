// Packages
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// Routes
import authRoutes from "./routes/authRoutes";
// import usersRoutes from "./routes/usersRoutes";
// Middlewares
import { notFound, errorHandler } from "./middlewares/errorsMiddleware";
// Config
import connectDB from "./config/db";
import { setupSwagger } from "./config/swagger";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin: "https://your-frontend-domain.com",
    credentials: true,
  }),
);

app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("Server is up!");
});

app.use("/api/auth", authRoutes);
// app.use("/users", usersRoutes);
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

app.listen(port as number, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs at http://domain:${port}/api-docs`);
});
