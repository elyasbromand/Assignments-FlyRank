import express from "express";
import ticketsRouter from "./src/routes/tickets.js";


const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  console.log("/health called");
  res.status(200).json({ status: "ok" });
});

app.use("/tickets", ticketsRouter);


// The json error handler
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON body" });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});