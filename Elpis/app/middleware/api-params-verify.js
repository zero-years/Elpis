const Ajv = require('ajv');
const ajv = new Ajv();

/**
 * API 参数校验
 */
module.exports =(app)=>{
    // schema 版本
    const $schema = 'http://json-schema.org/draft-07/schema#';
    return async (ctx,next)=>{
        // 只对 API 请求做参数校验
        if (ctx.path.indexOf('/api/') < 0){
            return await next();
        }
        
        // 获取请求参数
        const { body, query, headers} = ctx.request;
        const { params,path, method} = ctx;

        app.logger.info(`[${method} ${path}] body:${JSON.stringify(body)}`);
        app.logger.info(`[${method} ${path}] query:${JSON.stringify(query)}`);
        app.logger.info(`[${method} ${path}] params:${JSON.stringify(params)}`);
        app.logger.info(`[${method} ${path}] headers:${JSON.stringify(headers)}`);

        // 获取每个 routerSchema 下的文件内相应的 schema 描述
        const schema = app.routerSchema[path]?.[method.toLowerCase()];

        if(!schema){ //卫语
            return await next();
        }

        let  valid = true;
        
        //  ajv校验器
        let validate;
        
        // 校验headers
        if(valid && headers && schema.headers){
            // 为每个 schema 文件加上对应的校验版本
            schema.headers.$schema = $schema;
            // 生成校验工具
            validate =ajv.compile(schema.headers);
            // 对headers进行校验
            valid = validate(headers);
        }
        
        // body
        if(valid && body && schema.body){
            // 为每个 schema 文件加上对应的校验版本
            schema.body.$schema = $schema;
            // 生成校验工具
            validate =ajv.compile(schema.body);
            // 对 body 进行校验
            valid = validate(body);
        }

        // query
        if(valid && query && schema.query){
            // 为每个 schema 文件加上对应的校验版本
            schema.query.$schema = $schema;
            // 生成校验工具
            validate =ajv.compile(schema.query);
            // 对 query 进行校验
            valid = validate(query);
        }

        // params
        // if(valid && params && schema.params){
        //     console.log('params:loader')
        //     // 为每个 schema 文件加上对应的校验版本
        //     schema.params.$schema = $schema;
        //     // 生成校验工具
        //     validate =ajv.compile(schema.params);
        //     // 对 params 进行校验
        //     valid = validate(params);
        // }

        if(!valid){
            ctx.status=200;
            ctx.body ={
                success:false,
                code:442,
                message: `request validate fail: ${ajv.errorsText(validate.errors)}`,
            }
            return;
        }
        await next();
    }
}