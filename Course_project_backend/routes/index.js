const Router = require('express')
const router = new Router()

const timeRouter = require('./timeRouter')
const userRouter = require('./userRouter')
const scheduleRouter = require('./scheduleRouter')
const cellRouter = require('./cellRouter')
const teacherRouter = require('./teacherRouter')
const showtableRouter = require('./showtableRouter')

router.use('/time', timeRouter)
router.use('/user', userRouter)
router.use('/schedule', scheduleRouter)
router.use('/cell', cellRouter)
router.use('/teacher', teacherRouter)
router.use('/', showtableRouter)

module.exports = router