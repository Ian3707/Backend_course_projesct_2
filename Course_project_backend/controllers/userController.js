const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

const generateJwt = (id, login) => {
    return jwt.sign(
        {id, login}, 
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    ) 
}

 
class UserController {
    async registration(req, res){
        const {login, password} = req.body
        try{
            if(!login || !password){
                return res.status(404).json({ message: 'Некорректный логин или пароль' })
            } 
            if(login.length > 20){
                return res.status(500).json({ message: 'Введите имя пользователя до 20 символов' });
            }
            if(password.length > 16){
                return res.status(500).json({ message: 'Введите пароль до 16 символов' });
            }

            const candidate = await User.findOne({where: {login}})
            if(candidate){
                return res.status(409).json({ message: 'Пользователь уже существует!' })
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({login, password: hashPassword})
            if(!user){
                return res.status(500).json({ message: 'Ошибка при добавлении пользователя' });
            }
            const token = generateJwt(user.id, user.login)
            const user_id = user.id;
            return res.status(200).json({user_id, login, token})
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res){
        try{
            const {login, password} = req.body
            const user = await User.findOne({where:{login}})
            if(!user){
                return res.status(500).json({ message: 'Пользователь не найден' })
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if(!comparePassword){
                return res.status(401).json({ message: 'Неверный пароль' })
            }
            const token = generateJwt(user.id, user.login)
            const user_id = user.id;
            return res.status(200).json({user_id, login, token})
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async edit(req, res){
        const { id } = req.params;
        const {login, password} = req.body

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        try{
            if(id != decoded.id){
                return res.status(403).json({message: "Вы не можете редактировать чужую учетную запись"})
            }
            if(login.length > 20){
                return res.status(500).json({ message: 'Введите имя пользователя до 20 символов' });
            }
            if(password.length > 16){
                return res.status(500).json({ message: 'Введите пароль до 16 символов' });
            }
            if(login){
                const [rowsUpdated, [updatedUser]] = await User.update({login}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
                return res.status(200).json(updatedUser);
            }
            if(password){
                const hashPassword = await bcrypt.hash(password, 5)
                const [rowsUpdated, [updatedUser]] = await User.update({password: hashPassword}, 
                    {
                    where: {id},
                    returning: true
                    });
                if (rowsUpdated === 0) {
                    return res.status(404).json({ message: 'Запись не найдена' });
                }
                return res.status(200).json(updatedUser);
            }
        }catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async check(req, res){
        try{
            const token = generateJwt(req.user.id, req.user.login)
            return res.status(200).json({token})
        } catch(err){
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res){
        const { id } = req.params;

        const token = req.headers.authorization.split(' ')[1] //Bearer [token]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        
        if(id != decoded.id){
            return res.status(403).json({message: "Вы не можете удалить чужую учетную запись"})
        }

        try {
            const user = await User.destroy({
                where: { id }
            });
            if (!user) { 
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            return res.status(200).json({ message: 'Пользователь удален' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController()