const {Time, Schedule} = require('../models/models')
const jwt = require('jsonwebtoken')

class TimeController {
    async create(req, res){
        const {value, scheduleId} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try{
            if(!value || !scheduleId){
                return res.status(404).json({ message: "Это поле не может быть пустым!"});
            }
            const schedulecheck = await Schedule.findOne({
                where: [{id: scheduleId}, {userId: decoded.id}]
            });
            if(!schedulecheck){
                return res.status(403).json({message: "Расписание не существует или не принадлежит вам"})
            }

                const timeCount = await Schedule.findOne({
                    attributes: ['time_counter'],
                    where: {id: scheduleId},
                });

                let new_count 
                if(!timeCount){
                    new_count = 1
                }
                else{
                    new_count = timeCount.get('time_counter') + 1
                }
                if(parseInt(timeCount.counter) > 9){
                    return res.status(400).json({ message: "Вы не можете создать больше записей" });
                }
            
                const time = await Time.create({userId: decoded.id, value, scheduleId})

                const [rowsUpdated] = await Schedule.update({time_counter: new_count}, 
                    {
                    where: {id: scheduleId},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }

                return res.status(200).json(time)
          }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
          }
    }

    async edit(req, res){
        const { id } = req.params;
        const { value } = req.body;

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const time = await Time.findOne(
            {
                where: [{id}, {userId: decoded.id}],
            }
        )
        if(!time){
            return res.status(403).json({message: "Запись не существует или не принадлежит вам"})
        }
        try {
            const [rowsUpdated, [updatedTime]] = await Time.update({ value }, {
                where: { id },
                returning: true
            });
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json(updatedTime);
          } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
          }
    }

    async get(req, res){
        const { id } = req.body;
/*
        const timeCount = await Time.findOne({
            attributes: ['value'],
            where: { userId: 1 }
        });
        let yy = timeCount.value
        return res.json({yy})*/

        try{
            const time = await Time.findOne(
                {
                  where: {id},
                }
            )
            if(!time){
                return res.status(404).json({ message: "Значение не найдено"});
            }
            return res.status(200).json(time)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res){
        const { id } = req.params;
        const { scheduleId } = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try {
            const checkacess = await Schedule.findOne(
                {
                    where: [{id: scheduleId}, {userId: decoded.id}],
                }
            )
            if(!checkacess){
                return res.status(403).json({message: "Запись не существует или не принадлежит вам"})
            }
            const time = await Time.destroy({
            where: { id }
            });
            if (!time) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            const timeCount = await Schedule.findOne({
                attributes: ['time_counter'],
                where: { scheduleId }
            });
            const [rowsUpdated] = await Schedule.update({counter: timeCount.get('counter') - 1}, 
                {
                where: {id: scheduleId},
                returning: true
                });
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            return res.status(200).json({ message: 'Запись удалена' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new TimeController()