import express from "express";
import {
  listTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
} from "../services/tasks.services.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await listTasks();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    const created = await createNewTask(title);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await getTask(req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const updated = await updateExistingTask(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteExistingTask(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
