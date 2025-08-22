const md5 = require('md5');
import { ElMessage } from 'element-plus';

/**
 * 前端封装的 curl 方法
 * 
 * @param url 请求地址
 * @param method 请求方式，默认为 post
 * @param headers 请求头
 * @param query url 中的 query 参数
 * @param data post 请求中的 body 
 * @param responseType 响应数据类型 
 * @param timeout 超时时间
 * @param errorMessage 错误信息
 */
const curl = ({
    url,
    method = 'post',
    headers = {},
    query = {},
    data = {},
    responseType = 'json',
    timeout = 60000,
    errorMessage ='网络异常',
}) =>{
    // 接口签名处理(让接口变动态，此步和后端签名校验类似)
    const signKey ='zyear1api2key';
    const st = Date.now();
    
    const dtoHeaders = {
        ...headers,
        s_t:st,
        s_sign: md5(`${signKey}_${st}`)
    }

    if(url.indexOf('/api/proj/') > -1 && window.projKey){
        dtoHeaders.proj_key = window.projKey
    }

    // 构造请求的参数 (把参数转换为 axios 中能够使用的参数)
    const axiosSetting = {
        url,
        method,
        params: query,
        data,
        responseType,
        timeout,
        headers:dtoHeaders
    }

    // 返回一个运用已经构造好的请求参数发送的 axios 请求
    return axios.request(axiosSetting).then((response)=>{
        const responseData = response.data || {}

        // 后端 API 的返回格式
        const { success } = responseData;
        
        // 失败
        if(!success){
            // 拿取错误信息和错误代码
            const { message, code} = responseData
            
            if(code === 445){
                ElMessage.error('请求不合法');
            }else if(code === 442){
                ElMessage.error('请求参数异常');
            }else if(code === 446){
                ElMessage.error('缺少项目相关参数');
            }else if(code === 50000){
                ElMessage.error(message);
            }else{
                ElMessage.error(errorMessage);
            } 

            console.log(`error: ${message}`);
            
            return Promise.resolve({ success, code, message});
        }

        // 成功
        const {data, metadata} = responseData;
        
        return Promise.resolve({success, data, metadata});
    }).catch((error)=>{
        const { message } = error;

        if( message.match(/timeout/)){
            return Promise.resolve({
                message: 'Request Timeout',
                code: 504
            })
        }

        return Promise.resolve(error);
    })
} 

export default curl;