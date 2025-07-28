import connectDB from "./config/db";
import { app } from "./app";

const port = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
  res.send("Server is up!");
});

app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger docs at https://question-api-75d6.onrender.com/api-docs`,
  );
});
