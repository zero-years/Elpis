const glob =require('glob');
const path = require('path');
const { sep } = path; // 用处:兼容不同操作系统上的斜杠( 各个操作系统中的斜杆会不一样 在mac和linux为:/ 在windows为:\ )

/**
 * middleware loader
 * @param {object} app Koa 实例
 * 
 * 加载所有middleware，可通过'app.middlewares.${目录}.${文件}' ，访问
 * 
   例子:
   app/middleware
      |
      | -- custom-module
                |
                |  -- custom-middleware.js
    
    ==> app.middleware.customModule.customMiddleware
 *
 */
module.exports=(app) => {
    const middlewares = {};

    // 读取/elpis/app/middleware/**/**.js下的所有文件
    const elpisMiddlewarePath = path.resolve(__dirname,`..${sep}..${sep}app${sep}middleware`);
    const elpisFileList = glob.sync(path.resolve(elpisMiddlewarePath,`.${sep}**${sep}**.js`));
    elpisFileList.forEach(file => {
        handleFile(file);
    });

    // 读取业务根目录/app/middleware/**/**.js下的所有文件
    const businessMiddlewarePath = path.resolve(app.businessPath,`.${sep}middleware`);
    const businessFileList = glob.sync(path.resolve(businessMiddlewarePath,`.${sep}**${sep}**.js`));
    businessFileList.forEach(file => {
        handleFile(file);
    });

    // 把所有内容加载到app.middlewares下
    function handleFile(file){
            // 提取文件名称
            let name = path.resolve(file);
            // 截取路径 AS: app/middlewares/custom-module/custom-middleware.js => custom-module/custom-middleware
            name = name.substring(name.lastIndexOf(`middleware${sep}`) + `middleware${sep}`.length,name.lastIndexOf('.'));
            // 把'-'统一改为驼峰式 AS:custom-module/custom-middleware => customModule.customMiddleware
    
            name = name.replace(/[_-][a-z]/ig,(s)=> s.substring(1).toUpperCase());
            // 挂载middleware 到 内存 APP 对象中
            let tempMiddleware = middlewares;
            const names = name.split(sep)
            for (let i =0,len = names.length;i < len;i++){
                if(i == len - 1){
                    tempMiddleware[names[i]] =require(path.resolve(file))(app);
                }else{
                    if(!tempMiddleware[names[i]]){
                        tempMiddleware[names[i]] = {}
                    }
                    // tempMiddleware === { customModule:{ a:{ b:{ } } } }
                    tempMiddleware = tempMiddleware[names[i]]
                    // tempMiddleware === {}
                }
            }
    }
    app.middlewares = middlewares;
}