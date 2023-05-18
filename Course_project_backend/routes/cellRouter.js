const Router = require('express')
const router = new Router()
const cellController = require('../controllers/cellController')
const checkUser = require('../middleware/checkUserMiddleware')

router.post('/', checkUser(), cellController.create)
router.post('/edit/:id', checkUser(), cellController.edit)
router.get('/:id', checkUser(), cellController.getOne)
router.get('/', checkUser(), cellController.getRow)
router.delete('/delete/:id', checkUser(), cellController.delete)

module.exports = router