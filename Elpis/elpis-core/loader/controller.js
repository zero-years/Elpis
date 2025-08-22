const glob =require('glob');
const path = require('path');
const { sep } = path; // 用处:兼容不同操作系统上的斜杠( 各个操作系统中的斜杆会不一样 在mac和linux为:/ 在windows为:\ )

/**
 * controller loader
 * @param {object} app Koa 实例
 * 
 * 加载所有controller，可通过'app.controller.${目录}.${文件}' ，访问
 * 
   例子:
   app/controller
      |
      | -- custom-module
                |
                |  -- custom-controller.js
    
    ==> app.controller.customModule.customController
 *
 */
module.exports=(app) => {
    const controller = {};

    // 读取/elpis/app/controller/**/**.js下的所有文件
    const elpisControllerPath = path.resolve(__dirname,`..${sep}..${sep}app${sep}controller`);
    const elpisFileList = glob.sync(path.resolve(elpisControllerPath,`.${sep}**${sep}**.js`));
    elpisFileList.forEach(file => {
        handleFile(file);
    });

    // 读取业务根目录 app/controller/**/**.js下的所有文件
    const businessControllerPath = path.resolve(app.businessPath,`.${sep}controller`);
    const businessFileList = glob.sync(path.resolve(businessControllerPath,`.${sep}**${sep}**.js`));
    businessFileList.forEach(file => {
        handleFile(file);
    });

    // 遍历所有文件目录，把所有内容加载到app.controller下
    function handleFile(file){
            // 提取文件名称
            let name = path.resolve(file);
           
            // 截取路径 AS: app/controller/custom-module/custom-controller.js => custom-module/custom-controller
            name = name.substring(name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length,name.lastIndexOf('.'));
            // 把'-'统一改为驼峰式 AS:custom-module/custom-controller.js => customModule.customController
            name = name.replace(/[_-][a-z]/ig,(s)=> s.substring(1).toUpperCase());
         
            // 挂载controller 到 内存 APP 对象中
            let tempController = controller;
            const names = name.split(sep) //[customModule,customController]
            /* 例子:
                [a,b,c,d]
                
                *第一次循环
                tempcontroller[a] = {}
                tempcontroller = tempcontroller[a]
            
                *第二次循环
                tempcontroller[b] ={}
                tempcontroller =tempcontroller[a]
    
                *此时内部结构为
                tempcontroller:{a:{ b:{}}}
                因此可以通过app.controller.a.b读取
            */  
    
            for (let i =0,len = names.length;i < len;i++){
                if(i == len - 1){ // 文件
                    const ControllerMoule = require(path.resolve(file))(app)
                    tempController[names[i]] =new ControllerMoule();
                }else{  //文件夹
                    if(!tempController[names[i]]){
                        tempController[names[i]] = {}
                    }
                    // tempController === { customModule:{ a:{ b:{ } } } }
                    tempController = tempController[names[i]]
                    // tempController === {}
                }
            }
    }
    app.controller = controller;
}