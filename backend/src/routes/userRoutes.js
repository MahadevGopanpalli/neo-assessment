const express = require('express');
const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(AuthMiddleware); 

router.post('/', (req, res) => UserController.register(req, res));
router.post('/get', (req, res) => UserController.getAll(req, res));
router.get('/:id', (req, res) => UserController.getById(req, res));
router.put('/:id', (req, res) => UserController.update(req, res));
router.delete('/:id', (req, res) => UserController.delete(req, res));

module.exports = router;