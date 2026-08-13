import {
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createTask,
} from "../repositories/tasks.repository.js";
import { NotFoundError, ValidationError } from "../errors.js";

async function listTasks() {
  try {
    return await getAllTasks();
  } catch (err) {
    throw err;
  }
}

async function getTask(id) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const task = await getTaskById(taskId);
    if (!task) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }
    return task;
  } catch (err) {
    throw err;
  }
}

async function createNewTask(title) {
  try {
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError("Title is required");
    }

    return await createTask(title.trim());
  } catch (err) {
    throw err;
  }
}

async function updateExistingTask(id, changes) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const task = await getTaskById(taskId);
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

    return await updateTask(taskId, changes);
  } catch (err) {
    throw err;
  }
}

async function deleteExistingTask(id) {
  try {
    const taskId = Number.parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      throw new ValidationError("Invalid id");
    }

    const deleted = await deleteTask(taskId);
    if (!deleted) {
      throw new NotFoundError(`Task ${taskId} not found`);
    }

    return true;
  } catch (err) {
    throw err;
  }
}

export { listTasks, getTask, createNewTask, updateExistingTask, deleteExistingTask };
