const Router = require('express')
const router = new Router()
const timeController = require('../controllers/timeController')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/', checkUser(), timeController.create)
router.post('/edit/:id', checkUser(), timeController.edit)
router.get('/', checkUser(), timeController.get)
router.delete('/delete/:id', checkUser(), timeController.delete)

module.exports = router