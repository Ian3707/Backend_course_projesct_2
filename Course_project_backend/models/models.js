const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    added_schedule: {type: DataTypes.INTEGER},
})

const Schedule = sequelize.define('schedule', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    time_counter: {type: DataTypes.INTEGER},
    index: {type: DataTypes.INTEGER},
    share_code: {type: DataTypes.STRING},
})

const Cell = sequelize.define('cell', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    teacher: {type: DataTypes.STRING},
    subject: {type: DataTypes.STRING},
    chamber: {type: DataTypes.STRING},
    index: {type: DataTypes.INTEGER},
    day_index: {type: DataTypes.INTEGER},
})

const Time = sequelize.define('time', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    value: {type: DataTypes.STRING},
})

const Teacher = sequelize.define('teacher', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    info: {type: DataTypes.STRING},
})


User.hasMany(Schedule, { onDelete: 'CASCADE' })
Schedule.belongsTo(User)

Schedule.hasMany(Cell, { onDelete: 'CASCADE' })
Cell.belongsTo(Schedule)

Time.hasMany(Cell, { onDelete: 'CASCADE' })
Cell.belongsTo(Time)

Schedule.hasMany(Teacher, { onDelete: 'CASCADE' })
Teacher.belongsTo(Schedule)

User.hasMany(Teacher, { onDelete: 'CASCADE' })
Teacher.belongsTo(User)

Schedule.hasMany(Time, { onDelete: 'CASCADE' })
Time.belongsTo(Schedule)

User.hasMany(Time, { onDelete: 'CASCADE' })
Time.belongsTo(User)

module.exports = {
    User,
    Schedule,
    Cell,
    Time,
    Teacher
}