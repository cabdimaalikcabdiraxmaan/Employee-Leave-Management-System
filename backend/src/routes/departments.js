const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/departmentsController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', verifyToken, ctrl.get);
router.post('/', verifyToken, authorizeRoles('ADMIN'), ctrl.create);
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), ctrl.remove);

module.exports = router;
