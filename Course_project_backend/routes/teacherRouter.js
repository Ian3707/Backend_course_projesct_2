const Router = require('express')
const router = new Router()
const teacherController = require('../controllers/teacherController')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/', checkUser(), teacherController.create)
router.post('/edit/:id', checkUser(), teacherController.edit)
router.get('/:id', checkUser(), teacherController.getOne)
router.get('/', checkUser(), teacherController.getAll)
router.delete('/delete/:id', checkUser(), teacherController.delete)

module.exports = router