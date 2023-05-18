const Router = require('express')
const router = new Router()
const scheduleController = require('../controllers/scheduleController')
const checkUser = require('../middleware/checkUserMiddleware')

router.get('/', checkUser(), scheduleController.getAdded)

module.exports = router