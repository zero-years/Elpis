const merge = require('webpack-merge');
const path = require('path');
const os = require('os')
const HappyPack = require('happypack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin') ;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

// 多线程 build 设置
const happypackCommonConfig ={
    debug: false,
    threadPool: HappyPack.ThreadPool({ size: os.cpus().length })
}

// 基类配置
const baseConfig = require('./webpack.base');

// 生产环境 webpack 配置
const webpackConfig = merge.smart(baseConfig,{
    // 指定生产环境模式
    mode:'production',
    // 生产环境的 output 配置
    output:{
        // 每次输出前先将原内容清空
        clean:true,
        // 输出文件的名字
        filename:'js/[name]_[chunkhash:8].bundle.js',
        // 输出的路径
        path: path.resolve(process.cwd(),'./app/public/dist/prod'),
        // 资源输出路径
        publicPath: '/dist/prod/',
        // 跨域问题
        crossOriginLoading:'anonymous'
    },
    module:{
        rules:[
        // {
        //     test: /\.css$/,
        //     use:[
        //         MiniCssExtractPlugin.loader,
        //         `${require.resolve('HappyPack/loader')}?id=css`
        //     ]
        // },
        {
            test:/\.js$/,
            include :[
                // 只针对该路径下的 js 进行处理 (只对业务代码进行 babel ,加快打包数据的速度)
                // 处理 elpis 目录下的 js 文件
                path.resolve(__dirname,'../../pages'),
                // 处理 业务 目录下的 js 文件
                path.resolve(process.cwd(),'./app/pages')
            ],
            use: [
                `${require.resolve('happypack/loader')}?id=js`    
            ]
        }]
    },
    // webpack 不会有大量 hints 信息,默认为 warning
    performance:{
        hints: false
    },

    plugins: [
        // 提取 css 的公共部分，有效利用缓存
        new MiniCssExtractPlugin({
            chunkFilename: 'css/[name]_[contenthash:8].bundle.css',
        }),
        // 每次 build 前,清空 public/dist 目录
        new CleanWebpackPlugin(['public/dist'],{
            root: path.resolve(process.cwd(),'./app/'), // 目录
            exclude: [], // 排除的内容
            verbose: true,  // 将日志写入控制台
            dry: false  // 模拟文件删除
        }),
        // 优化并压缩 css 资源
        new CSSMinimizerPlugin(),
        // 多线程打包 js 加快打包速度
        new HappyPack({
            ...happypackCommonConfig,
            id:'js',
            loaders: [ `${require.resolve('babel-loader')}?${JSON.stringify({
                presets: [require.resolve('@babel/preset-env')],
                plugins: [
                    require.resolve('@babel/plugin-transform-runtime')
                ]
            })}`]
        }),
        // 多线程打包 css 加快打包速度
        new HappyPack({
            ...happypackCommonConfig,
            id:'css',
            loaders: [{
                path: require.resolve('css-loader'),
                options:{
                    importLoader: 1
                }
            }]
        }),
        // 浏览器在请求资源时，不发送用户的身份凭证 (安全策略)
        new HtmlWebpackInjectAttributesPlugin({
            crossorigin: 'anonymous'
        })
    ],

    optimization: {
        // 使用 TerserWebpackPlugin 的并发和缓存,提升压缩阶段的性能
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({
                cache: true, // 启用缓存加速构建过程
                parallel: true, // 利用多核 CPU 的优势来加速压缩速度
                terserOptions:{
                    compress :{
        // 清除 console.log
                        drop_console: true, // 去掉 console.log 的内容
                    }
                }
            })
        ]
    },
});

module.exports = webpackConfig;