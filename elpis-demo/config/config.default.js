module.exports = {
    name: 'Elpis-demo',
    jwtSecreKey: '',
    db: {
        client: 'mysql',
        connection: {
            host: '',
            port: '',
            database: '',
            user: '',
            password: ''
        },
        pool: {
            min: 5,
            max: 20
        }
    },
    apiSignVerify: {
        whiteList: [
            '/api/auth/logout'
        ]
    }
}