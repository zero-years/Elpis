module.exports = {
    name: 'Elpis-demo',
    jwtSecreKey: 'd426ee41acf9943c50fa39efc6358a8f',
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