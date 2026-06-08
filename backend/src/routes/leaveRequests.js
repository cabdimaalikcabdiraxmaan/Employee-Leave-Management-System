const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveRequestsController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.get);
router.post('/', verifyToken, authorizeRoles('EMPLOYEE','MANAGER','ADMIN'), ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);
router.post('/:id/approve', verifyToken, authorizeRoles('MANAGER','ADMIN'), ctrl.approve);
router.post('/:id/reject', verifyToken, authorizeRoles('MANAGER','ADMIN'), ctrl.reject);

module.exports = router;
