<template>
  <el-form
    v-if="schema && schema.properties"
    :inline="true"
    class="schema-search-bar"
  >
    <!-- 动态组件 -->
    <el-form-item
      v-for="(schemaItem, key) in schema.properties"
      :key="key"
      :label="schemaItem.label"
    >
      <!-- 展示子组件 -->
      <component
        :is="SearchItemConfig[schemaItem.option?.comType]?.component"
        :ref="searchComList"
        :schemaKey="key"
        :schema="schemaItem"
        @loaded="handleChildLoader"
      ></component>
    </el-form-item>
    <!-- 操作区域 -->
    <el-form-item>
      <el-button
        type="primary"
        plain
        class="search-btn"
        @click="search"
      >
        搜索
      </el-button>
      <el-button
        plain
        class="reset-btn"
        @click="reset"
      >
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>
    
<script setup>
import { ref, toRefs, onMounted} from 'vue';
import SearchItemConfig from './search-item-config.js';

const props = defineProps({
    /**
     *  schema 配置，结构如下
     *  {
            type: 'object', 
            properties: {
                key: {
                    ...schema, // 基础配置
                    type: '', // 字段的类型
                    label: '', // schema 的中文名称
                    // 字段在 search-bar 中的相关配置
                    option: {
                        ...elComponentConfig, // 标准 el-conponent-column 配置
                        comType: '', // 配置控件类型 AS: inpiut | select | button |.....
                        default: '', // 默认值
                    }
                },
            },
        }
     */
    schema: Object
})
const { schema } = toRefs(props);

const emit = defineEmits([ 'load', 'search', 'reset']);

const searchComList = ref([]);

const getValue = () => {
    let dtoObj = {};
    searchComList.value.forEach(component => {
        dtoObj = {
            ...dtoObj,
            ...component?.getValue()
        }
    })
    return dtoObj
}

let childComponentLoadedCount =0;
const handleChildLoader = () => {
    childComponentLoadedCount ++;
    if(childComponentLoadedCount >= Object.keys(schema?.value?.properties).length){
        emit('load', getValue());
    }
}

const search = () => {
    emit('search', getValue());
}

const reset = () => {
    searchComList.value.forEach(component => component?.reset());
    emit('reset');
}

onMounted(() => {
})

defineExpose({
    reset,
    getValue
})

</script>
    
<style lang="less">
    .schema-search-bar{
        min-width: 500px;

        .input {
          width:180px;
        }
        .select{
          width: 180px;
        }
        .dynamicSelect{
          width: 180px;
        }
        .search-btn{
            width: 100px;
        }
        .reset-btn{
            width: 100px;
        }
    }
</style>