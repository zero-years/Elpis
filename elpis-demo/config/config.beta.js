module.exports = {
    name: 'Elpis-demo-beta',
    db: {
        client: 'mysql',
        connection: {
            host: 'sh-cdb-dk9aq886.sql.tencentcdb.com',
            port: '29593',
            database: 'elpis-beta',
            user: 'root',
            password: '!Asd935265322'
        },
        pool: {
            min: 5,
            max: 20
        }
    }
}