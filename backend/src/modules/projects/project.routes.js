const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask
} = require('./project.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Task specific routes
router.route('/tasks/:id')
    .put(updateTask)
    .delete(authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER'), deleteTask);

// Nested route for creating task on a project
router.route('/:projectId/tasks')
    .post(authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER'), createTask);

// Project routes
router.route('/')
    .get(getProjects)
    .post(authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER'), createProject);

router.route('/:id')
    .get(getProject)
    .put(authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER'), updateProject)
    .delete(authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER'), deleteProject);

module.exports = router;
