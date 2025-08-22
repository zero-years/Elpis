const Koa =require('koa');
const path = require('path');
const { sep } = path; // 用处:兼容不同操作系统上的斜杠( 各个操作系统中的斜杆会不一样 在mac和linux为:/ 在windows为:\ )

// 环境配置文件
const env = require('./env');

// 配置BFF层的所有loder
const middlewareLoader = require('./loader/middleware');
const routerSchemaLoader = require('./loader/router-schema');
const routerLoader = require('./loader/router');
const controllerLoader = require('./loader/controller');
const serviceLoader = require('./loader/service');
const configLoader = require('./loader/config');
const extendLoader = require('./loader/extend');

module.exports = {
    /**
     * 启动项目
     * @params options 项目配置
        options = {
            name // 项目名称
            homePath //项目首页
        }
     */
    start(options={}){
        // koa实例
        const app = new Koa();
        
        // 应用配置
        app.options = options;

        // 记录路径
        
        // 基础路径(项目的根目录)
        app.baseDir = process.cwd();

        // 业务路径(存放所有项目文件的目录)
        app.businessPath = path.resolve(app.baseDir,`.${sep}app`);

        // 初始化环境配置
        app.env = env()
        console.log(`-[start] env:${app.env.get()}`);

        // 加载BFF层的所有loader
        // 加载middleware
        middlewareLoader(app);
        console.log(`-[start] load middleware done--`);

        // 加载routerSchema
        routerSchemaLoader(app);
        console.log(`-[start] load routerSchema done--`);

        // 加载controller
        controllerLoader(app);
        console.log(`-[start] load controller done--`);

        // 加载service
        serviceLoader(app);
        console.log(`-[start] load service done--`);

        // 加载config
        configLoader(app)
        console.log(`-[start] load config done--`);

        // 加载extend
        extendLoader(app)
        console.log(`-[start] load extend done--`);

        // 注册 elpis 全局中间件
        const elpisMiddlewarePath = path.resolve(__dirname, `..${sep}app${sep}middleware.js`);
        const elpisMiddleware = require(elpisMiddlewarePath);
        elpisMiddleware(app);
        console.log(`-[start] load global elpis middleware done--`);

        // 注册业务全局中间件
        // 用户的中间件默认写在 app/middleware.js 下
        try {
            require(`${app.businessPath}${sep}middleware.js`)(app)
            console.log(`-[start] load global business middleware done--`);
        } catch (e) {
            console.log( '[exception] there is no global business middleware file.')
        }

        // 注册路由
        routerLoader(app);
        console.log(`-[start] load router done--`);

        // 启动服务
        try{
            const port = process.env.PORT || 8080;
            const host = process.env.IP || '0.0.0.0';
            app.listen(port,host);
            console.log(`Server runnin on port: ${port}`);
        } catch(e){
            console.error(e);
        }

        return app;
    }
}
