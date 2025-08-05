// Packages
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
// Routes
import authRoutes from "./routes/authRoutes";
import templateRoutes from "./routes/templateRoutes";
import questionsRoutes from "./routes/questionsRoutes";
import questionnaireRoutes from "./routes/questionnaireRoutes";
// import usersRoutes from "./routes/usersRoutes";
// Middlewares
import { notFound, errorHandler } from "./middlewares/errorsMiddleware";
// Config
import { setupSwagger } from "./config/swagger";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const whitelist = [
  "https://frontend-question.onrender.com",
  "http://localhost:5173",
  "http://localhost:5000",
];

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       // allow REST tools / server-side calls without Origin
//       if (!origin || whitelist.includes(origin)) return cb(null, true);
//       cb(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );
// app.use(
//   cors({
//     credentials: true,
//   }),
// );

app.use(cors());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Server is up!");
});

app.use("/api/auth", authRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
// app.use("/users", usersRoutes);
setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

export { app };
