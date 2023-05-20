const Router = require('express')
const router = new Router()
const scheduleController = require('../controllers/scheduleController')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/', checkUser(), scheduleController.create)
router.post('/edit/:id', checkUser(), scheduleController.edit)
//router.get('/', checkUser(), scheduleController.getAll)
//router.get('/:id', checkUser(), scheduleController.getOne)
router.get('/index/:index', checkUser(), scheduleController.getByIndex)
router.get('/send/:code', checkUser(), scheduleController.getByCode)
router.delete('/delete/:index', checkUser(), scheduleController.delete)

module.exports = router