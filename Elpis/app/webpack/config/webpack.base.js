const glob = require('glob');
const { VueLoaderPlugin }= require('vue-loader');
const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

// 动态构造 elpis 的 entry 和 最终渲染页面文件
const elpisPageEntries = {};
const elpisHtmlWebpackPluginList = [];
// 获取 elpis/app/pages 目录下所有入口文件 入口文件约定(entry.xx.js)
const elpisEntryList = path.resolve(__dirname, '../../pages/**/entry.*.js');
glob.sync(elpisEntryList).forEach(file => {
    handlerFile(file, elpisPageEntries, elpisHtmlWebpackPluginList);
});

// 动态构造 业务的 entry 和 最终渲染页面文件
const businessPageEntries = {};
const businessHtmlWebpackPluginList = [];
// 获取 elpis/app/pages 目录下所有入口文件 入口文件约定(entry.xx.js)
const businessEntryList = path.resolve(process.cwd(), './app/pages/**/entry.*.js');
glob.sync(businessEntryList).forEach(file => {
    handlerFile(file, businessPageEntries, businessHtmlWebpackPluginList);
});

// 构造相关 webpack 处理的数据结构
function handlerFile(file, entries = {}, htmlWebpackPluginList = []) {
        const entryName = path.basename(file, '.js');
        // 构造 entry (入口配置)
        entries[entryName] = file
        // 构造最终渲染的页面文件 (HtmlWebpackPlugin)
        htmlWebpackPluginList.push(
            // html-webpack-plugin 辅助注入打包后的 bundle 文件到 tpl 文件中
            new HtmlWebpackPlugin({
                // 产物(最终模板) 输出路径
            filename: path.resolve(process.cwd(),'./app/public/dist',`${entryName}.tpl`),
            // 指定要使用的模板文件
            template: path.resolve(__dirname,'../../view/entry.tpl'),
            // 要注入的代码块
            chunks: [ entryName ]
            })
        );
}

// 加载业务 webpack 配置
let businessWebpackConfig = {};
try{
    businessWebpackConfig = require(`${process.cwd()}/app/webpack.config.js`);
} catch(e){

}

/**
 *  webpack 基础配置
 */
module.exports =merge.smart({
    // 入口配置
    entry:Object.assign({}, elpisPageEntries, businessPageEntries),

    // 模块解析配置(决定了要加载解释哪些模块，以及用什么方式去解释)
    module:{
        rules: [{
            test:/\.vue$/,
            use: {
                loader: require.resolve('vue-loader')
            }
        },{
            test:/\.js$/,
            include :[
                // 只针对该路径下的 js 进行处理 (只对业务代码进行 babel ,加快打包数据的速度)
                // 处理 elpis 目录下的 js 文件
                path.resolve(__dirname,'../../pages'),
                // 处理 业务 目录下的 js 文件
                path.resolve(process.cwd(),'./app/pages')
            ],
            use: {
                loader: require.resolve('babel-loader')
            }
        },{
            test:/\.(png|jpe?g|gif)(\?.+)?$/,
            use:{
                loader: require.resolve('url-loader'),
                options:{
                    limit: 300,
                    esModule: false
                }
            }
        },{
            test:/\.css$/,
            use: [ 
                require.resolve('style-loader'),
                require.resolve('css-loader')
            ]
        },{
            test:/\.less$/,
            use: [ require.resolve('style-loader'),
                   require.resolve('css-loader'),
                   require.resolve('less-loader')
                ]
        },{
            test:/\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
            use: require.resolve('file-loader')
        }
    ]
    },

    // 产物输出路径，因为开发和生产环境输出不一致，所以在各自环境中自行配置
    output:{},

    // 配置模块解析的具体行为(定义 webpack 在打包时，如何找到并解析具体模块的路径)
    resolve:{
        // 匹配的路径后缀
        extensions:['.js', '.vue', '.less', '.css'],
        // 别名 指可以将某个路径以另一个名字代替 例子: ./app/pages => $elpisPages 
        alias: (() => {
        
            const aliasMap = {};
            const blankModulePath = path.resolve(__dirname, '../libs/blank.js');

            // dashboard 路由拓展配置
            const businessDashBoardRouterConfig = path.resolve(process.cwd(), './app/pages/dashboard/router.js');
            aliasMap['$businessDashBoardRouterConfig'] = fs.existsSync(businessDashBoardRouterConfig)? businessDashBoardRouterConfig : blankModulePath;

            // schema-view component 扩展配置
            const businessComponentConfig = path.resolve(process.cwd(), './app/pages/dashboard/complex-view/schema-view/components/component-config.js');
            aliasMap['$businessComponentConfig'] = fs.existsSync(businessComponentConfig)? businessComponentConfig : blankModulePath;

            // schema-form 扩展配置
            const businessFormItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-form/form-item-config.js');
            aliasMap['$businessFormItemConfig'] = fs.existsSync(businessFormItemConfig)? businessFormItemConfig : blankModulePath;

            // search-bar 扩展配置
            const businessSearchItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-search-bar/search-item-config.js');
            aliasMap['$businessSearchItemConfig'] = fs.existsSync(businessSearchItemConfig)? businessSearchItemConfig : blankModulePath;

            // header-container 扩展配置
            const businessHeaderConfig = path.resolve(process.cwd(), './app/pages/widgets/header-container/header-config.js');
            aliasMap['$businessHeaderConfig'] = fs.existsSync(businessHeaderConfig)? businessHeaderConfig : blankModulePath;

            return {
                'vue': require.resolve('vue'),
                '@babel/runtime/helpers/asyncToGenerator': require.resolve('@babel/runtime/helpers/asyncToGenerator'),
                '@babel/runtime/regenerator': require.resolve('@babel/runtime/regenerator'),
                $elpisPages: path.resolve(__dirname, '../../pages'),
                $elpisCommon: path.resolve(__dirname, '../../pages/common'),
                $elpisCurl: path.resolve(__dirname, '../../pages/common/curl.js'),
                $elpisUtils: path.resolve(__dirname, '../../pages/common/utils.js'),
                $elpisWidgets: path.resolve(__dirname, '../../pages/widgets'),
                $elpisHeaderContainer: path.resolve(__dirname, '../../pages/widgets/header-container/header-container.vue'),
                $elpisSiderContainer: path.resolve(__dirname, '../../pages/widgets/sider-container/sider-container.vue'),
                $elpisSchemaTable: path.resolve(__dirname, '../../pages/widgets/schema-table/schema-table.vue'),
                $elpisSchemaForm: path.resolve(__dirname, '../../pages/widgets/schema-form/schema-form.vue'),
                $elpisSchemaSearchBar: path.resolve(__dirname, '../../pages/widgets/schema-search-bar/schema-search-bar.vue'),
                $elpisStore: path.resolve(__dirname, '../../pages/store'),
                $elpisBoot: path.resolve(__dirname, '../../pages/boot.js'),
                ...aliasMap
            }
        })()
    },

    // 配置 webpack 插件
    plugins:[
        //  处理 .vue 文件的必须插件
        // 它的功能是将你定义过的其他规则复制并应用到 .vue 文件里
        //  例子: 如果有一条匹配规则为 /\.js$/ ，则它会运用到 .vue 文件中的 <script> 板块中
        new VueLoaderPlugin(),

        // 把第三方库暴漏到 window context 下
        new webpack.ProvidePlugin({
            Vue: 'vue',
            axios: 'axios',
            _: 'lodash'
        }),

        // 定义全局常量
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: 'true', // 支持 vue 解析支持 optionsApi
            __VUE_PROD_DEVTOOLS__: 'false', // 禁用 Vue 调试工具
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false', // 禁用生产环境显示的 "水合" 信息
        }),

        // 构造最终渲染的页面模板
        ...elpisHtmlWebpackPluginList,
        ...businessHtmlWebpackPluginList
    ],
    
    // 打包输出优化(配置代码分割、模块合并、缓存、TreeShaing、压缩等优化策略)
    optimization:{
        /**
         * 分包策略: 把 js 文件打包成3种类型，优先级从上到下
         *    1. vendor: 第三方 lib 库，基本不会改动，除非版本改动
         *    2. common: 业务组件代码的公共部分抽取出来，改动较少
         *    3. entry.{page}: 不同页面 entry 里的业务组件代码的差异部分，经常改动
         * 目的: 把改动和引用频率不一样的 js 区分出来，以达到更好利用浏览器缓存的效果
         */
        splitChunks: {
            chunks:'all', // 对同步和异步模块都进行分割
            maxAsyncRequests: 10, // 每次异步加载时的最大并行请求数
            maxInitialRequests: 10, // 入口点的最大并行请求数
            cacheGroups: { // 缓存组(也就每一个单独的包的配置)
                vendor:{ // 第三方依赖库
                    test: /[\\/]node_modules[\\/]/, //打包 node_modules 下的第三方文件
                    name: 'vendor', // 模块名称 
                    priority: 20, // 优先级(默认为0)，数字越大优先级越高
                    enforce: true, // 是否强制执行
                    reuseExistingChunk: true, // 是否需要复用已经打包的公共 chunk
                },
                common:{ // 公共模块
                    test: /[\\/]common|widgets[\\/]/,
                    name:'common', // 模块名称 
                    minChunks: 2, // 被两处或两处以上引用才被归为公共模块
                    minSize: 1, // 文件的大小大于几时被归为公共模块
                    priority: 10, // 优先级(默认为0)，数字越大优先级越高
                    reuseExistingChunk: true, // 是否需要复用已经打包的公共 chunk
                },
            }
        },
         // 将 webpack 运行时生成的代码打包到 runtime.js 
        runtimeChunk: true
    }
}, businessWebpackConfig);