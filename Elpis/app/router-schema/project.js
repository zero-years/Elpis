module.exports ={
   // 遵循 RESTful 规范
   // get:{}, // 用于读取资源
   // post: {}, // 用于新增资源
   // put: {}, // 用于更新资源(客户端提供更新后的完整资源)
   // patch: {}, //用于删除资源
   '/api/project':{
    get:{
      query:{
         type:'object',
         properties:{
            proj_key:{
               type:'string'
            }
         },
         required:['proj_key']
      }
    }
   },
   '/api/project/list':{
    get:{
      query:{
         type: 'object',
         properties:{
            proj_key:{
               type: 'string',
            }
         }
      }
    },
   },
   '/api/project/model_list': {
    get:{},
   }
}