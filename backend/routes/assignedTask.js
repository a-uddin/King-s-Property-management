const express = require('express');
const router = express.Router();
const { getAllAssignedTasks, createAssignedTask, updateAssignedTask, updateTaskStatus } = require('../controllers/assignedTaskController');
const { getAssignedTasksWithAssetDetails } = require('../controllers/assignedTaskController');

const requireAuth = require('../middleware/requireAuth');

// Protect all assigned-task routes
router.use(requireAuth);

// GET all assigned tasks
router.get('/', getAllAssignedTasks);

// POST create a new assigned task
router.post('/', createAssignedTask);

// PATCH update an assigned task (✅ ADD THIS!)
router.patch('/:id', requireAuth, updateAssignedTask);

// PATCH for Update TaskStatus
//router.patch('/status/:id', updateTaskStatus);

// New PATCH route to update task status
router.patch('/update-status/:id', updateTaskStatus);

// Get assigned Task with Asset details
router.get('/with-asset', getAssignedTasksWithAssetDetails);


module.exports = router;
