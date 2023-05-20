const { Schedule, User, Teacher, Cell, Time } = require("../models/models")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sequelize = require('../db')

class ScheduleController {
    async create(req, res){
        try{
            const token = req.headers.authorization.split(' ')[1] //Bearer [token]
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            
            const {name} = req.body
            if(name.length > 30){
                return res.status(403).json({ message: "Максимальное число символов - 30" });
            }

            const check_name = await Schedule.findOne({
                where: [{userId: decoded.id}, {name}]
            })

            let new_index
            const maxIndex = await Schedule.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('index')), 'maxIndex']],
                where: {userId: decoded.id},
            });
            if(maxIndex.get('maxIndex') === null){
                new_index = 0
            }
            else{
                new_index = maxIndex.get('maxIndex') + 1;
            }
            if(maxIndex.get('maxIndex') >= 9){
                return res.status(403).json({ message: "Вы не можете создать больше записей" });
            }

            if(check_name){
                return res.status(409).json({ message: 'У вас уже есть расписание с таким именем'});
            }
            if(!name){
                return res.status(404).json({ message: 'Это поле не может быть пустым' }); 
            }

            const shareCode = (await bcrypt.hash(name, 5)).slice(10, 20)
            const schedule = await Schedule.create({name, index: new_index ,share_code: shareCode, userId: decoded.id})



            return res.status(200).json(schedule)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' }); 
        }
    }

    async getAll(req, res){
        try{
            const token = req.headers.authorization.split(' ')[1] //Bearer [token]
            const decoded = jwt.verify(token, process.env.SECRET_KEY)

            const schedules = await Schedule.findAndCountAll({
                where: { userId: decoded.id },
                include: 
                [
                    {
                        model: Cell,
                        attributes: ['id', 'teacher', 'subject', 'chamber', 'day_index', 'timeId'] 
                    },
                    {
                        model: Time,
                        attributes: ['id', 'value'] 
                    },
                    {
                        model: Teacher,
                        attributes: ['id', 'name', 'info'] 
                    }
                ]
            });

            if(!schedules){
                return res.status(404).json({ message: "Записи не найдены"});
            }
            return res.status(200).json(schedules);
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getOne(req, res){
        try{
            const {id} = req.params
            
            const schedule = await Schedule.findOne(
            {
                where: {id},
                include: 
                [
                    {
                        model: Cell,
                        attributes: ['id', 'teacher', 'subject', 'chamber', 'day_index', 'timeId'] 
                    },
                    {
                        model: Time,
                        attributes: ['id', 'value'] 
                    },
                    {
                        model: Teacher,
                        attributes: ['id', 'name', 'info'] 
                    }
                ]
            }
            )

            if(!schedule){
                return res.status(404).json({ message: "Запись не найдена"});
            }
            return res.status(200).json(modifiedSchedule)
        } catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getByIndex(req, res){
        const {index} = req.params
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        try{
            const schedule = await Schedule.findOne({
                where: [{userId: decoded.id}, {index}],
                include: 
                [
                    {
                        model: Cell,
                        attributes: ['id', 'teacher', 'subject', 'chamber', 'day_index', 'timeId'] 
                    },
                    {
                        model: Time,
                        attributes: ['id', 'value'] 
                    },
                    {
                        model: Teacher,
                        attributes: ['id', 'name', 'info'] 
                    }
                ]
            })

            const numberOfSchedules = await Schedule.count({
                where: { userId: decoded.id },
            });
            const modifiedSchedule = { ...schedule.toJSON(), numberOfSchedules };

            if(!schedule){
                return res.status(404).json({ message: "Запись не найдена"});
            }
            return res.status(200).json(modifiedSchedule)
        } catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getByCode(req, res){
        const {code} = req.params
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        try{
            const schedule = await Schedule.findOne(
            {
                where: {share_code: code},
            }
            )
            if(!schedule){
                return res.status(404).json({ message: "Запись не найдена"});
            }
            await User.update({added_schedule: schedule.get('id')}, 
                {
                where: {id: decoded.id},
                returning: true
                });
            return res.status(200).json(schedule)
        } catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getAdded(req, res){
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        try{
            const userCode = await User.findOne(
                {
                    where: {userId: decoded.id},
                }
            )
            const schedule = await Schedule.findOne(
                {
                    where: [{userId: decoded.id}, {share_code: userCode.get('share_code')}],
                }
            )
            if(!schedule){
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json(schedule);
        } catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async edit(req, res){
        const { id } = req.params; //previous name
        const { name } = req.body;

        if(name.length > 30){
            return res.status(403).json({ message: "Максимальное число символов - 30" });
        }

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const schedule = await Schedule.findOne(
            {
                where: [{id}, {userId: decoded.id}],
            }
        )
        if(!schedule){
            return res.status(403).json({message: "Расписание не существует или не принадлежит вам"})
        }

        try {
            const [rowsUpdated, [updatedSchedule]] = await Schedule.update({ name }, {
                where: { id },
                returning: true
            });
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json(updatedSchedule);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res){
        const { index } = req.params;
        if(!index){
            return res.status(404).json({ message: 'Index не найден' });
        }
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        
        //const index = schedule.get('index')
        try {
            const scheduleCheck = await Schedule.findOne({
                where: [{ index: parseInt(index) }, { userId: decoded.id }],
                
            });
            if(!scheduleCheck){
                return res.status(403).json({message: "Расписание не существует или не принадлежит вам"})
            }

            const schedule = await Schedule.destroy({
                where: [{index: parseInt(index)}, {userId: decoded.id}],
            });
            ///
            const maxIndex = await Schedule.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('index')), 'maxIndex']],
                where: {userId: decoded.id},
            });


            let delete_count = maxIndex.get('maxIndex') - parseInt(index) 
            let delete_counter = 1
            while(delete_counter <= delete_count){
                const [rowsUpdated] = await Schedule.update({index: parseInt(index) + delete_counter - 1}, 
                    {
                    where: [{userId: decoded.id}, {index: parseInt(index) + delete_counter}],
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }

                ++delete_counter
            }
            ///
            if (!schedule) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json({ message: 'Запись удалена' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ScheduleController()