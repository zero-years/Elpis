module.exports =(app)=>{
    const BaseService = require('./base')(app)
    const modeList = require('../../model/index')(app);
    return class ProjectService extends BaseService{
        /**
         * 根据 projKey 获取项目配置
         */
        get(projKey){
            // let projConfig;

            // modeList.forEach(modelItem =>{
            //     if(modelItem.project[projKey]){
            //         projConfig = modelItem.project[projKey]
            //     }
            // })

            // return projConfig;
            
            let projConfig = modeList.find(item => item.project && item.project[projKey]);
            return projConfig ? projConfig.project[projKey] : void(0);  
        };

       /**
        *  获取统一模型下的项目列表 (如果无 projKey, 取全量)
        * @param {*} param0 
        */
        getList({ projKey }) {         
            return modeList.reduce((prelist,modelItem)=>{
                const { project } = modelItem;

                // 如果有传 projKey 则只取当前同模型下的项目，不传的情况下
                if(projKey && !project[projKey]){ 
                    return prelist
                };
                
                for(const prkey in project){
                    prelist.push(project[prkey]);
                }

                return prelist
            },[]);
       }
       
        /**
        * 获取所有模型与项目的结构化数据 
        * @returns modelList
        */
        async getModelList(){
            return modeList;
       }
    }
}