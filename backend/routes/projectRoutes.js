import express from "express";
import {
  getUserProjects,
  getProjectsByUserId,
  createProject,
  getProjectResources,
  addResource,
} from "../controllers/projectController.js";

const router = express.Router();

// Project routes
router.get("/", getUserProjects);
router.get("/user/:userId", getProjectsByUserId);
router.post("/", createProject);

// Resource routes
router.get("/:projectId/resources", getProjectResources);
router.post("/:projectId/resources", addResource);

export default router;
