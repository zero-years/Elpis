const _ = require('lodash');
const path = require('path');
const { sep } = path;
const glob = require('glob');

// project 继承 model 方法 
const projectExtendModel = (model, project) =>{
    // 处理数组合并的特殊情况
        // 因为 project 继承 model ，所以需要分别具有处理修改和新增内容的方式
            // 1. project 有的键值，model 也有 => 修改(重载)
            // 2. project 有的键值, model 没有 => 新增
            // 3. project 没有的键值,model 有 => 继承
    // mergeWith 会在 model 和 project 遇到冲突合并(相同键)时执行合并函数，他接受 modelValue 和 proValue 两个冲突的值
    return _.mergeWith({}, model , project , (modelValue, projValue) => {
        if(Array.isArray(modelValue) && Array.isArray(projValue)){
            let result = [];
            // 处理修改和保留
            for (let i = 0;i < modelValue.length;i++){
                let modeItem = modelValue[i];
                const projItem = projValue.find(projItem => projItem.key === modeItem.key);
                //  如果 project 有的键值, model 也有，则调用递归 projectExtendModel 进行深层次的修改覆盖
                result.push(projItem ? projectExtendModel(modeItem, projItem) : modeItem);  
            };

            // 处理新增
            for (let i = 0;i< projValue.length;i++){
                let projItem =  projValue[i];
                const modelItem = modelValue.find(modeItem => modeItem.key === projItem.key);
                if(!modelItem){
                    result.push(projItem);
                }
            };
            return result
        }
    })
}
    
/**
 *  解析 model 配置，并返回组织且继承后的数据结构
 *  modelList = [{
 *      model: ${model},
 *      project: {
 *          proj1key: ${project1},
 *          proj2key: ${project2}
 *      }
 *  },...]
 * 
 */

module.exports = (app) => {
    const modelList = [];
    //  遍历当前的文件夹，构造模型数据结构，然后挂载到 modelList 上
    //  获取文件夹的绝对路径
    const modelPath = path.resolve(process.cwd(), `.${sep}model`);
    //  将路径组合为对象
    const fileList = glob.sync(path.resolve(modelPath, `.${sep}**${sep}**.js`));
    //  进行遍历
    fileList.forEach(file =>{
        // 判断是否为 index ，是则返回
        if(file.indexOf('index.js') > -1){ return };
        let fileName = path.resolve(file)
        // 区分配置类型 (model / project)
        const type =fileName.indexOf(`${sep}project${sep}`) > -1 ? 'project' : 'model';
        
            if(type === 'project'){
            const modelkey = file.match(/\/model\/(.*?)\/project/)?.[1];
            const projkey = file.match(/\/project\/(.*?)\.js/)?.[1];
            let modelItem = modelList.find(item => item.model?.key === modelkey);
            if(!modelItem){ //初始化 model 结构
                modelItem ={};
                modelList.push(modelItem);
            }
            if(!modelItem.project){ // 初始化 project 结构
                modelItem.project = {};
            }
            // 将相应的 key 挂载到 modelItem 上
            modelItem.project[projkey] = require(path.resolve(file));
            modelItem.project[projkey].key = projkey; //注入 projkey
            modelItem.project[projkey].modelKey = modelkey; // 注入 modelKey
        }

        if(type === 'model'){
            const modelkey = file.match(/\/model\/(.*?)\/model\.js/)?.[1];
            let modelItem = modelList.find(item => item.model?.key === modelkey);
            if(!modelItem){ // 初始化 model 结构
                modelItem = {};
                modelList.push(modelItem);
            }
            // 将相应的 model 挂载到 modelItem 上
            modelItem.model = require(path.resolve(file));
            modelItem.model.key = modelkey; //注入 modelkey
        }
    })
        
    // 数据进一步整理: project => 继承 model
    modelList.forEach(item =>{
        const { model, project } = item;
        for (const key in project) {
            project[key] = projectExtendModel(model,project[key]);
        }
    })

    return modelList
}