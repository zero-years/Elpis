const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

// 基类配置
const baseConfig = require('./webpack.base');

// dev-server 配置
const DEV_SERVER_CONFIG = {
    HOST: '127.0.0.1',
    PORT: 9002,
    HMR_PATH: '__webpack_hmr', //官方规定
    TIMEOUT: 20000
}

// 拼接 hmr 路径
const {HOST, PORT, HMR_PATH, TIMEOUT} = DEV_SERVER_CONFIG;
const hmrPath = `http://${HOST}:${PORT}/${HMR_PATH}&timeout=${TIMEOUT}&reload=true`;

// 开发阶段的 entry 配置需要加入 hmr
Object.keys(baseConfig.entry).forEach((v) => {
    // 第三方包不作为 hmr 入口
    if(v !== 'vendor') {
        baseConfig.entry[v] = [
            // 主入口文件
            baseConfig.entry[v],
            // hmr 配置更新入口,官方指定的 hmr 路径
            `${require.resolve('webpack-hot-middleware/client')}?path=${hmrPath}`
        ]
    }
})

// 开发环境 webpack 配置
const webpackConfig = merge.smart(baseConfig,{
    // 指定开发环境模式
    mode:'development',
    // source-map 开发工具 呈现代码的映射关系，便于在开发中调试代码
    devtool: 'eval-cheap-module-source-map',
    // 开发环境的 output 配置
    output:{
        filename:'js/[name]_[chunkhash:8].bundle.js',
        path: path.resolve(process.cwd(), './app/public/dist/dev/'), // 文件存储路径
        publicPath: `http://${DEV_SERVER_CONFIG.HOST}:${DEV_SERVER_CONFIG.PORT}/public/dist/dev/`, //外部资源公共路径
        globalObject: 'this'
    },
    // 开发阶段插件
    plugins: [
        // 支持热更新，实现热模块替换(HMR)
        // 模块热替换允许在程序运行时替换模块，让应用程序一直保持运行状态，提升开发效率
        new webpack.HotModuleReplacementPlugin({
            multiStep: false,
        })
    ]
});

module.exports = {
    // webpack 配置
    webpackConfig,
    // devServer 配置，暴露给 dev.js 使用
    DEV_SERVER_CONFIG
}