const path = require('path');

module.exports = (app) =>{
    // 配置静态根目录
    const koaStatic =require('koa-static');
    app.use(koaStatic(path.resolve(__dirname,'./public')));
    app.use(koaStatic(path.resolve(process.cwd(),'./app/public')));
    // 模板渲染引擎
    
    // 引入 koaNunjucks 用于渲染模板
    const koaNunjucks = require('koa-nunjucks-2')

    // 挂载到app
    app.use(koaNunjucks({
        ext:'tpl', //文件结尾
        path: path.resolve(process.cwd(),'./app/public'),
        nunjucksConfig:{
            noCache:true,
            trimBlocks:true
        }
    }))

    // 引入 ctx.body 解析中间件 能够解析 post 、 get 请求的信息，也就是 request 中的 body、query、headers 内的信息
    const bodyParser = require('koa-bodyparser');
    app.use(bodyParser({
        formList:'1000mb', //大小
        enableType: ['form','json','test'] // 允许的类型
    })) 

    // 引入异常捕获中间件 error-handler
    app.use(app.middlewares.errorHandler);

    // 引入签名合法性校验中间件 api-sign-verify
    app.use(app.middlewares.apiSignVerify);

    // 引入 API 参数校验中间件 api-params-verify
    app.use(app.middlewares.apiParamsVerify);

    // 引入 相关项目处理内容 中间件
    app.use(app.middlewares.projectHandler);
}