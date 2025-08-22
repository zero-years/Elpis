import { ref, watch, onMounted,nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '$elpisStore/menu.js';

export const useSchema = function() {
    const route = useRoute();
    const menuStore = useMenuStore();

    const api = ref('');
    const tableSchema = ref({});
    const tableConfig = ref({});
    const searchSchema = ref({});
    const searchConfig = ref({});
    const components = ref({});

    /**
     * 构造 schemaConfig 的相关配置， 输送给 schemaView 解析
     * 
     */
    const buildData = function() {
        const { key, sider_key: siderKey } = route.query;

        const mItem = menuStore.findMenuItem({
            key: 'key',
            value: siderKey ?? key
        })

        if(mItem && mItem.schemaConfig){
            const{ schemaConfig: sConfig, componentConfig } = mItem;

            const configSchema = JSON.parse(JSON.stringify(sConfig.schema));

            api.value = sConfig.api ?? '';
            tableSchema.value = {};
            tableConfig.value = undefined;
            searchSchema.value = {};
            searchConfig.value = undefined;
            components.value = {};

            nextTick(()=> {
                // 构造 tableSchema 和 tableConfig
                tableSchema.value = buildDtoSchema(configSchema, 'table');
                tableConfig.value = mItem.tableConfig;

                // 构造 searchSchema 和 searchConfig
                const dtoSearchSchema = buildDtoSchema(configSchema, 'search');
                // 当页面跳转时，查看页面是否带有默认搜索值
                for (const key in dtoSearchSchema.properties){
                    if(route.query[key] !== undefined){
                        dtoSearchSchema.properties[key].option.default = route.query[key];
                    }
                }
                searchSchema.value = dtoSearchSchema;
                searchConfig.value = mItem.searchConfig;

                // 构造 components = { key: { schema: {} , config: {} }}
                 if(componentConfig && Object.keys(componentConfig).length > 0){
                    const dtoComponents = {}

                    for( const  comName in componentConfig ){
                        dtoComponents[comName] = { 
                            schema: buildDtoSchema(configSchema, comName),
                            config: componentConfig[comName]
                        }
                    }
                    components.value = dtoComponents
                 } 
            })
        }
    }

    /**
     * 处理 schema 数据，将需要数据从 shcema 中单独提取出来 (清除噪音)
     * 
     * @param _schema schema 数据
     * @param comName 需要提取的 schema 信息名
     */
    const buildDtoSchema = (_schema, comName) => {
        if(!_schema?.properties){ return };

        const dtoSchema = {
            type: 'object',
            properties: {}
        }

        // 提取有效的 shcema 信息
        for(const key in _schema.properties){
            const props = _schema.properties[key];
            if(props[`${comName}Option`]){
                let dtoProps = {};
                // 提取 props 中非 option 的部分，存放到 dtoProps 中
                for(const pKey in props){
                    if(pKey.indexOf('Option') < 0){
                        dtoProps[pKey] = props[pKey];
                    }
                }
                // 处理 comName Option
                dtoProps = Object.assign({}, dtoProps, { option: props[`${comName}Option`]});

                 // 处理 required 字段
                const { required } = _schema;
                if( required && required.find(pk => pk === key)){
                    dtoProps.option.required = true;
                }
                dtoSchema.properties[key] = dtoProps;
            }
        }

        return dtoSchema;
    }

    watch([
        () => route.query.key,
        () => route.query.sider_key,
        () => menuStore.menuList
    ],()=>{
        buildData()
    },{ deep: true })

    onMounted(()=>{
        buildData()
    });

    return {
        api,
        tableSchema,
        tableConfig,
        searchSchema,
        searchConfig,
        components
    }
}