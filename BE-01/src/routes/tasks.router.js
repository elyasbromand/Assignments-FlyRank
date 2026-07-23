import express from "express";
import {
  listTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
} from "../services/tasks.services.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const data = listTasks();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/", (req, res, next) => {
  try {
    const { title } = req.body;
    const created = createNewTask(title);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const task = getTask(req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const updated = updateExistingTask(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    deleteExistingTask(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
