const KoaRouter =require('koa-router')
const glob =require('glob');
const path = require('path');
const { sep } = path; // 用处:兼容不同操作系统上的斜杠( 各个操作系统中的斜杆会不一样 在mac和linux为:/ 在windows为:\ )

/**
 * router loader
 * @param {object} app koa 实例 
 * 
 * 解析所有 app/router/ 下所有 js 文件，加载到 KoaRouter 下
 * 
 */

module.exports=(app) => {
    // 实例化 KoaRouter
    const router =  new KoaRouter()

    // 找到 elpis 路由文件路径
    const elpisRouterPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}router`)
    // 注册所有 elpis 路由
    const elpisFileList = glob.sync(path.resolve(elpisRouterPath,`.${sep}**${sep}**.js`))
    elpisFileList.forEach(file =>{
        require(path.resolve(file))(app,router)
    });
    
    // 找到业务路由文件路径
    const businessRouterPath = path.resolve(app.businessPath, `.${sep}router`)
    // 注册所有业务路由
    const businessFileList = glob.sync(path.resolve(businessRouterPath,`.${sep}**${sep}**.js`))
    businessFileList.forEach(file =>{
        // 每个router文件内的内容
        // module.exports = (app,router)=>{
        //  router.get('xxx/xx/xx/',xxxContro)
        // }
        require(path.resolve(file))(app,router)
    });

    // 路由兜底(健壮性)
    router.get('*',async (ctx , next) =>{
        ctx.status = 302; // 临时重定向
        ctx.redirect(`${app?.options?.homePage ?? '/'}`)
    });

    // 路由注册到 app 上
    // 组装匹配好的路由，返回一个合并好的中间件
    app.use(router.routes());
    // 当发送不符合要求的请求时返回 405
    app.use(router.allowedMethods());
}
