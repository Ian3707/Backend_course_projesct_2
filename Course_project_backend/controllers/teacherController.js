const {Teacher, Schedule} = require('../models/models')
const jwt = require('jsonwebtoken')

class TeacherController{
    async create(req, res){
        const {name, info, scheduleId} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try{
            if(!name || !info || !scheduleId){
                return res.status(404).json({ message: "Эти поля не могут быть пустыми!"});
            }
            if(name.length > 184){
                return res.status(403).json({ message: "Максимальное число символов - 184 (Мы считали, ФИО длиннее нет)" });
            }
            if(info.length > 300){
                return res.status(403).json({ message: "Максимальное число символов описания - 300" });
            }


                const teacherCheck = await Teacher.findOne({
                    where: {name},
                }); 
                if(teacherCheck){
                    return res.status(409).json({ message: 'Преподаватель уже существует!' })
                }
                
                const amountCheck = await Teacher.findAndCountAll({
                    where: {scheduleId},
                });
                if(amountCheck.count > 49){
                    return res.status(400).json({ message: 'Скажи ты дурачек да? ТЕБЕ МАЛО 50 ПРЕПОДОВ???!!! ' });
                }

                const teacher = await Teacher.create({name, info, scheduleId, userId: decoded.id})

                return res.status(200).json(teacher)
          }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
          }
    }

    async edit(req, res){
        const {id} = req.params
        const {name, info} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
    
        try{
            if(name.length > 184){
                return res.status(403).json({ message: "Максимальное число символов - 184 (Мы считали, ФИО длиннее нет)" });
            }
            if(info.length > 300){
                return res.status(403).json({ message: "Максимальное число символов описания - 300" });
            }

            const checkteacher = await Teacher.findOne(
                {
                    where: [{id: id}, {userId: decoded.id}],
                }
            )
            if(!checkteacher){
                return res.status(403).json({message: "Запись не существует или не принадлежит вам"})
            }
            if(name){
                const [rowsUpdated] = await Teacher.update({name}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
            }
            if(info){
                const [rowsUpdated] = await Teacher.update({info}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
            }
            
            const teacher = await Teacher.findOne(
                {
                    where: {id},
                }
                )
            return res.status(200).json(teacher);
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getOne(req, res){
        try{
            const {id} = req.params
            const teacher = await Teacher.findOne(
            {
                where: {id},
            }
            )
            if(!teacher){
                return res.status(404).json({message: "Запись не найдена"})
            }
            return res.status(200).json(cell)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getAll(req, res){
        const {scheduleId} = req.body

        try{
            if(!scheduleId){
                return res.status(404).json({ message: "Не определено расписание"});
            }
            const teachers = await Teacher.findAll({
                where: {scheduleId}
            });
            if(!teachers){
                return res.status(404).json({message: "Запись не найдена"})
            }
            return res.status(200).json(teachers);
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    ///
    async getByName(req, res){
        const {second_name} = req.body
        try{
            const teacher = await Teacher.findOne(
            {
                where: {second_name: second_name},
            }
            )
            if(!teacher){
                return res.status(404).json({message: "Запись не найдена"})
            }
            return res.status(200).json(teacher)
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    ///

    async delete(req, res){
        const {id} = req.params
        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try{
            const checkteacher = await Teacher.findOne(
                {
                    where: [{id: id}, {userId: decoded.id}],
                }
            )
            if(!checkteacher){
                return res.status(403).json({message: "Запись не существует или не принадлежит вам"})
            }
    
            const teacher = await Teacher.destroy({
                where: {id}
            });
            if (!teacher) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json({ message: 'Запись удалена' });
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new TeacherController()