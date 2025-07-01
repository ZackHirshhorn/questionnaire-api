// Packages
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// Routes
import authRoutes from "./routes/authRoutes";
// import usersRoutes from "./routes/usersRoutes";
import schoolRoutes from "./routes/schoolRoutes";
import templateRoutes from "./routes/templateRoutes";
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

// app.use(
//   cors({
//     // origin: "http://localhost:5000",
//     credentials: true,
//   }),
// );

app.use(cors());

app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("Server is up!");
});

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/template", templateRoutes);
// app.use("/users", usersRoutes);
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger docs at https://question-api-01wm.onrender.com/api-docs`,
  );
});
