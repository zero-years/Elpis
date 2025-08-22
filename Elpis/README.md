#Elpis
##一个企业级应用，通过全栈实现

### model 配置
{
    mode: 'dashboard'; // 模板类型，不同的模板类型对应着不同的模板数据结构
    name: ''; // 配置的名称
    desc: ''; // 配置的描述
    icon: ''; // 图标
    homePage: ''; //首页(项目配置)

    // 头部模板
    menu:[{
        key: ' ',  // 每个模板唯一的 key 值 
        name: ' ', // 模板名称
        menuType: ' ', // 菜单的类型 group(有更多子模板) | module(单一模板)
        
        // 只有当 menuType 为 group 时才可以填写
        subMenu: [{
            // 能够递归的 subItem
        }, ...subMenu],

        // 只有当 menuType 为 module 时才可以填写
        moduleType: '', // 模板类型 sider | iframe | custom | schema
        
        // 当 moduleType === sider 时
        // sider 为侧边导航区 因此数据结构跟 menuType 类似，除 moduleType === sider 外，其他 menu 都为一个能够递归的 subItem
        siderConfig: {
            menu : [{

        }, ...menu]
        },

        // 当 moduleType === iframe 时
        iframeConfig: {
          path: '' // 相应的 iframe 路径  
        },

        // 当 moduleType === custom 时
        customConfig: {
            path: '' // 相应的 custom(自定义)路径
        },

        // 当 moduleType === schema 时
        schemaConfig: {
            api: '/api/user', // 数据源 API (遵循 RESTFUL 规范)
            schema: {
                type: 'object', 
                properties: {
                    key: {
                        ...schema, // 基础配置
                        type: '', // 字段的类型
                        label: '', // schema 的中文名称
                        // 字段在 table 中的相关配置
                        tableOption: {
                            ...elTableColumnConfig, // 标准 el-table-column 配置
                            toFixed: 0, // 保留小数点后几位
                            visible: true, // 默认为 true 该属性表示内容在不在表单中展示
                        },
                        // 字段在 search-bar 中的相关配置
                        searchOption: {
                            ...elComponentConfig, // 标准 el-conponent-column 配置
                            comType: '', // 配置控件类型 AS: inpiut | select | button |.....
                            default: '', // 默认值
                        },

                        // 当 comType === select
                        enumList: [],  // 下拉框可选项

                        // 当 comType === dynamicSelect
                        api: ''
                    },
                    // 字段在不同动态 component 中的相关配置，前缀对应 componentConfig 中的键值
                    // 如: componentConfig.createForm ，这里对应 createFormOption
                    // 字段在 createForm 中相关配置
                    createFormOption: {
                        ...elComponentConfig, // 标准 el-conponent 配置
                        comType: '', // 控件类型 input | select | input-number
                        visible: true, // 是否展示 (true/false), 默认为 true
                        disable: false, // 是否禁用 (true/false)，默认 false
                        default: '', // 默认值

                        // comType == select
                        enumList: [], // 枚举列表
                    },
                    // 字段在 editForm 中相关配置
                    editFormOption: {
                        ...elComponentConfig, // 标准 el-conponent 配置
                        comType: '', // 控件类型 input | select | input-number
                        visible: true, // 是否展示 (true/false), 默认为 true
                        disable: false, // 是否禁用 (true/false)，默认 false
                        default: '', // 默认值

                        // comType == select
                        enumList: [], // 枚举列表
                    },
                    // 字段在 detailPanel 中相关配置
                    detailPanelOption: {
                        ...elComponentConfig, // 标准 el-conponent 配置
                    }
                },

                // 标记那些字段是必填项
                required: [],
            },

            tableConfig: { // 关于 table 内容的配置
                headerButtons: [{
                    label:'', //按钮中文名
                    eventKey: '', // 按钮触发事件的名称
                    // 按钮具体配置
                    eventOption: {
                        // 当 eventKey === 'showComponent => 决定调出哪个组件的 show 事件
                        comName: '', // 组件名称
                    }, 
                    ...elButtonConfig // 标准 el-button 配置
                }, ...headerButtons],
                rowButtons: [{
                    label:'', //按钮中文名
                    eventKey: '', // 按钮触发事件的名称
                    eventOption: {
                        // 当 eventKey === 'showComponent => 决定调出哪个组件的 show 事件
                        comName: '', // 组件名称

                        // 当 eventKey === 'remove'
                        params: {
                            // paramKey = 参数的键值
                            // rowValueKey = 参数值格式为 schema::tableKey 时，到 table 中找到相应的字段
                            paramKey: rowValueKey 
                        }
                    }, // 按钮具体配置
                    ...elButtonConfig // 标准 el-button 配置
                }, ...rowButtons]
            },
            
            // 关于 search-bar 内容的配置
            searchConfig: { 
                
            },

            // 模块组件
            componentConfig: { 
                // create-form 表单相关配置
                createForm: {
                    title:'', // 表单标题
                    saveBtnText: '', // 保存按钮的文案
                },
                // edit-form 表单相关配置
                editForm: {
                    mainKey:'', // 表单主键，用于唯一标识要修改的数据对象
                    title:'', // 表单标题
                    saveBtnText:'', // 保存按钮
                },
                // detail-panel 相关配置
                detailPanel:{
                    mainKey:'',
                    title:''
                }
                // ...用户动态扩展其他组件
            },
        },
    }, ...menu]
}

### 服务端启动
const {
    serverStart
} = require('@zyear/elpis');

const app =serverStart({
    name: 'xxxx',
    homePage: 'xxxx'
})

### 自定义服务端
- router-schema
- router
- controller
- service
- extend
- config

### 前端构建
const { frontendBuild } = require('@zyear/elpis')

frontendBuild(process.env._Env)

### 自定义页面扩展
在 **app/pages/**  目录下写入口，入口格式为 entry.xxx.js

### dashboard/custom-view 自定义页面扩展
在 **app/pages/dashboard/xxx** 下写 **xxx** 页面组件

### dashboard/schema-view/component 动态组件扩展
- 1. 在 **app/pages/complex-view/schema-view/components/xxx** 下写 **xxx** 动态组件
- 2. 将相应动态组件配置到 **app/pages/complex/schema-view/components/component-config.js** 中

### schema-form 控件扩展
- 1. 在 **app/pages/widgets/schema-form/complex-view/xxx** 下写 **xxx** 控件
- 2. 将相应控件配置到 **app/pages/widgets/schema-form/form-item-config.js** 中

### schema-search-bar 控件扩展
- 1. 在 **app/pages/widgets/schema-search-bar/complex-view/xxx** 下写 **xxx** 控件
- 2. 将相应控件配置到 **app/pages/widgets/schema-search-bar/search-item-config.js** 中