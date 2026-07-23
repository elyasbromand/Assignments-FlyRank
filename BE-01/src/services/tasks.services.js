import {
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createTask,
} from "../repositories/tasks.repository";
import { NotFoundError, ValidationError } from "../errors";

function listTasks() {
  try {
    return getAllTasks();
  } catch (err) {
    throw err;
  }
}

function getTask(id) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const task = getTaskById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }
    return task;
  } catch (err) {
    throw err;
  }
}

function createNewTask(title) {
  try {
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError("Title is required");
    }

    return createTask(title.trim());
  } catch (err) {
    throw err;
  }
}

function updateExistingTask(id, changes) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const task = getTaskById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    if (changes.title !== undefined) {
      if (typeof changes.title !== "string" || changes.title.trim() === "") {
        throw new ValidationError("Title must be a non-empty string");
      }
      changes.title = changes.title.trim();
    }

    if (changes.done !== undefined) {
      changes.done = Boolean(changes.done);
    }

    return updateTask(taskId, changes);
  } catch (err) {
    throw err;
  }
}

function deleteExistingTask(id) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const deleted = deleteTask(taskId);
    if (!deleted) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    return true;
  } catch (err) {
    throw err;
  }
}

export { listTasks, getTask, createNewTask, updateExistingTask, deleteExistingTask };
