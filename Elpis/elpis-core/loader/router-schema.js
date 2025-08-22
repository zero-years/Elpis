const glob = require('glob');
const path = require('path');
const { sep } = path; // 用处:兼容不同操作系统上的斜杠( 各个操作系统中的斜杆会不一样 在mac和linux为:/ 在windows为:\ )

/**
 * router-schema loader
 * @param {object} app Koa 实例
 * 
 * 通过 json-schema & ajv 对API 规则进行约束，配合api-params-verify 中间件使用
 * 
 * 例子:
 *      app/router-schema/**.js
 
        输出:
        app.routeSchema = {
            '${api1}':'${jsonSchema}'
            '${api2}':'${jsonSchema}'
            '${api3}':'${jsonSchema}'
            '${api4}':'${jsonSchema}'
        }
 */
module.exports=(app) => {
    let routerSchema = {};

    // 读取/elpis/app/router-schema/**/**.js下的所有文件
     const ElpisRouterSchemaPath = path.resolve(__dirname,`..${sep}..${sep}app${sep}router-schema`);
     const ElpisFileList = glob.sync(path.resolve(ElpisRouterSchemaPath,`.${sep}**${sep}**.js`));
     ElpisFileList.forEach(file => {
        handleFile(file)
    })

     // 读取业务app/router-schema/**/**.js下的所有文件
     const BusinessRouterSchemaPath = path.resolve(app.businessPath,`.${sep}router-schema`);
     const BusinessFileList = glob.sync(path.resolve(BusinessRouterSchemaPath,`.${sep}**${sep}**.js`));
     BusinessFileList.forEach(file => {
        handleFile(file)
    })

    //  注册所有routerSchema，使得可以'app.routerSchema'这样访问

    // 处理过程
    function handleFile(file){
            routerSchema ={
                ...routerSchema,
                ...require(path.resolve(file))
            }
    }

    app.routerSchema = routerSchema
}