<template>
  <el-row class="schema-view">
    <search-panel
      v-if="searchSchema?.properties && Object.keys(searchSchema.properties).length > 0"
      @search="onSearch"
    ></search-panel>
    <table-panel
      ref="tablePanelRef"
      @operate="onTableOperate"
    ></table-panel>
    <component
      :is="ComponentConfig[key]?.component"
      v-for="(item, key) in components"
      :key="key"
      ref="comListRef"
      @command="onComponentCommand"
    >
    </component>
  </el-row>
</template>

<script setup>
  import { provide, ref } from 'vue';
  import SearchPanel from './complex-view/search-panel/search-panel.vue';
  import TablePanel from './complex-view/table-panel/table-panel.vue';
  import ComponentConfig from './components/component-config.js';
  import { useSchema } from './hook/schema.js';

  const apiParams = ref({});
  const { 
          api,
          tableSchema,
          tableConfig,
          searchSchema,
          searchConfig,
          components,
        } = useSchema();

  provide('schemaViewData', {
    api,
    tableSchema,
    tableConfig ,
    searchSchema,
    searchConfig,
    apiParams,
    components,
  })

  const tablePanelRef = ref(null);
  const comListRef = ref([]);

  const onSearch =(searchValObj) => {
    apiParams.value = searchValObj; 
  }

  // table 事件映射
  const EventHandleMap = {
    showComponent: showComponent
  }

  const onTableOperate = ({btnConfig, rowData}) => {
    const { eventKey } = btnConfig;
    if(EventHandleMap[eventKey]){
      EventHandleMap[eventKey]({btnConfig, rowData})
    }
  }

  // component 展示动态组件
  function showComponent({btnConfig, rowData}) {
    const { comName } = btnConfig.eventOption;
    if(!comName) {
      console.error(`无配置组件名`)
      return;
    }
    const comRef = comListRef.value.find(item => item.name === comName);
    if(!comRef || typeof comRef.show !== 'function' ){
      console.error(`找不到组件:${comName}`)
      return; 
    };
    comRef.show(rowData);
  }

  // 响应组件事件
  const onComponentCommand = (data) => {
    const { event } = data;
    // 通过判断子组件中抛出的 event 命令，然后确定要调取哪个事件
    if(event === 'loadTableData'){
      tablePanelRef.value.loadTableData();
    }
  }
</script>

<style lang="less" scoped>
  .schema-view{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>