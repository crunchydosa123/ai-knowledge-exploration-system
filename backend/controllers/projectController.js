import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all projects
const getUserProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        resources: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Get projects by user ID
const getProjectsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // First verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const projects = await prisma.project.findMany({
      where: {
        createdById: userId,
      },
      include: {
        resources: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ error: "Failed to fetch user projects" });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { userId, name } = req.body;

    // If userId is provided, use it; otherwise, find default user
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          username: "default",
        },
      });
    }

    if (!user) {
      return res.status(400).json({
        error:
          "User not found. Please provide a valid userId or ensure default user exists.",
      });
    }

    const project = await prisma.project.create({
      data: {
        name: name || "Untitled Project",
        createdById: user.id,
      },
      include: {
        resources: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Get resources for a specific project
const getProjectResources = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const resources = await prisma.resource.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.json(resources);
  } catch (error) {
    console.error("Error fetching project resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
};

// Add a new resource to a project
const addResource = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { url, text } = req.body;

    // First, get or create a default user
    const defaultUser = await prisma.user.findFirst({
      where: {
        username: "default",
      },
    });

    if (!defaultUser) {
      return res.status(400).json({
        error: "No default user found. Please create a user first.",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const resource = await prisma.resource.create({
      data: {
        url,
        text,
        createdById: defaultUser.id,
        projectId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error("Error adding resource:", error);
    res.status(500).json({ error: "Failed to add resource" });
  }
};

export {
  getUserProjects,
  getProjectsByUserId,
  createProject,
  getProjectResources,
  addResource,
};
