module.exports = (app) => {
    const BaseService = require('@zyear/elpis').Service.Base(app);

    return class UserService extends BaseService {
        async getByUsernameAndPassword({username, password}){
            const { database } = app;

            const res = await database('t_user').select('*').where({
                username,
                password,
                status: app.status.NORMAL
            }).limit(1);

            return res[0];
        }
    }
}