const Router = require('express')
const router = new Router()
const dayController = require('../controllers/dayController')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/', checkUser(), dayController.create)
//router.post('/edit/:id', checkUser(), dayController.edit)
router.get('/', checkUser(), dayController.getAll)
router.get('/:id', checkUser(), dayController.getOne)
//router.delete('/del/:id', checkUser(), dayController.delete)

module.exports = router