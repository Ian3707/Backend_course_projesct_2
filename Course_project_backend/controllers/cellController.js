const {Cell} = require('../models/models')
const {Schedule} = require('../models/models')
const jwt = require('jsonwebtoken')
const sequelize = require('../db')

class CellController {
    async create(req, res){
        const {scheduleId, teacher, subject, chamber, day_index, timeId} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        let new_index
        try {
            if(day_index < 0 || day_index > 6){
                return res.status(400).json({ message: "Такого дня не существует" });
            }
            const maxIndex = await Cell.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('index')), 'maxIndex']],
                where: [{scheduleId}, {day_index}, {timeId}],
            });
            if(maxIndex.get('maxIndex') === null){
                new_index = 0
            }
            else{
                new_index = maxIndex.get('maxIndex') + 1;
            }
            if(maxIndex.get('maxIndex') >= 4){
                return res.status(400).json({ message: "Вы не можете создать больше записей" });
            }

            if(!scheduleId || !teacher || !subject || !chamber || !day_index || !timeId){
                return res.status(500).json({ message: "Все поля обязательны для заполнения!" });
            }
            const checkCell = await Cell.findOne(
                {
                    where: [{scheduleId}, {day_index}, {timeId}, {index: new_index}],
                }
            )
            if(checkCell){
                return res.status(409).json({message: "Ячейка уже существует"})
            }
    
            const schedule = await Schedule.findOne(
                {
                    where: [{id: scheduleId}, {userId: decoded.id}],
                }
            )
    
            if(!schedule){
                return res.status(403).json({message: "Расписание не существует или не принадлежит вам"})
            }
            
            const cell = await Cell.create({scheduleId, teacher, subject, chamber, index: new_index, day_index, timeId})
            return res.status(200).json(cell)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: err.message });
        }
    }

    async getOne(req, res){
        try{
            const {id} = req.params;
            const cell = await Cell.findOne(
            {
                where: {id},
            }
            )
            if(!cell){
                return res.status(404).json({message: "Запись не найдена"})
            }
            return res.status(200).json(cell)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getRow(req, res){
        try{
            const {scheduleId, timeId} = req.body;
            const cells = await Cell.findAll(
            {
                where: [{scheduleId},{timeId}],
                order: [
                    ['day_index', 'ASC'],
                    ['index', 'ASC']
                ]
            }
            )
            if(!cells){
                return res.status(404).json({message: "Запись не найдена"})
            }
            return res.status(200).json(cells)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async edit(req, res){
        const {id} = req.params
        const {teacher, subject, chamber} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
    
        try{
            const scheduleId = await Cell.findOne({
                where: {id},
            })
            if(!scheduleId){
                return res.status(403).json({message: "Запись не существует"})
            }
            const schedule = await Schedule.findOne(
                {
                    where: [{id: scheduleId.get('scheduleId')}, {userId: decoded.id}],
                }
            )
            if(!schedule){
                return res.status(403).json({message: "Расписание не принадлежит вам"})
            }
            if(teacher){
                const [rowsUpdated] = await Cell.update({teacher}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
            }
            if(subject){
                const [rowsUpdated] = await Cell.update({subject}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
            }
            if(chamber){
                const [rowsUpdated] = await Cell.update({chamber}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
            }
            const сell = await Cell.findOne(
                {
                    where: {id},
                }
                )
            return res.status(200).json(сell);
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res){
        const {id, scheduleId, day_index, timeId, index} = req.body
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try{
            const schedule = await Schedule.findOne(
                {
                    where: [{id: scheduleId}, {userId: decoded.id}],
                }
            )
            if(!schedule){
                return res.status(403).json({message: "Расписание не существует или не принадлежит вам"})
            }
    
            const cell = await Cell.destroy({
                where: {id},
            });
            if (!cell) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            const maxIndex = await Cell.findOne({
                attributes: [[sequelize.fn('MAX', sequelize.col('index')), 'maxIndex']],
                where: [{scheduleId}, {day_index}, {timeId}],
            });

            let delete_count = maxIndex.get('maxIndex') - parseInt(index) 
            let delete_counter = 1
            while(delete_counter <= delete_count){
                const [rowsUpdated] = await Cell.update({index: parseInt(index) + delete_counter - 1}, 
                    {
                    where: [{scheduleId}, {day_index}, {timeId}, {index: parseInt(index) + delete_counter}],
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }

                ++delete_counter
            }

            return res.status(200).json({ message: 'Запись удалена' });
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new CellController()