// 本地开发启动 devServer
const express = require('express');
const path = require('path');
const consoler = require('consoler')
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = () => {
    // 从 webpack.dev.js 获取 webpack 配置和 devServer 配置
    const { 
        webpackConfig,
        DEV_SERVER_CONFIG
    } = require('./config/webpack.dev.js');

    console.log('xxxxxx',webpackConfig);

    const app = express();

    const compiler = webpack(webpackConfig);

    // 指定静态文件目录
    app.use(express.static(path.join(process.cwd(),'./app/public/dist')))

    // 引入 devMiddleware 中间件,监控文件改动
    app.use(devMiddleware(compiler,{
        // 落地文件 将文件写入 配置文件中指定磁盘的位置
        writeToDisk: (filePath) => filePath.endsWith('.tpl'),

        // 资源路径 将静态资源存入的位置 将 devMiddleware 绑定到该路径
        publicPath: webpackConfig.output.publicPath,

        // headers 配置 解决跨域问题等
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Request-With, content-type, Authorization'
        },

        // 打印日志，存在颜色
        stats: {
            colors:true
        }
    }))

    // 引入 hotMiddleware 中间件，实现热更新
    app.use(hotMiddleware(compiler,{
        // 热更新地址
        path: `/${DEV_SERVER_CONFIG.HMR_PATH}`,
        log:() => {}
    }))

    consoler.info('请等待webpack初次构建完成提示....')

    // 启动服务，启动 devServer
    const port = DEV_SERVER_CONFIG.PORT;
    app.listen(port,()=>{
        console.log(`app listening on port ${port}`)
})
}