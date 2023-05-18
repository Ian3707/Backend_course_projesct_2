const Router = require('express')
const router = new Router()
const UserController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/registration', UserController.registration)
router.post('/login', UserController.login)
router.post('/edit/:id', checkUser(), UserController.edit)
router.get('/authorization', authMiddleware, UserController.check)
router.delete('/delete/:id', checkUser(), UserController.delete)

module.exports = router