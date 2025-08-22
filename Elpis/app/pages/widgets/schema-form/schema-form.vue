<template>
  <el-row
    v-if="schema && schema.properties"
    class="schema-form"
  >
    <template v-for="(itemSchema, key) in schema.properties">
      <component
        :is="FormItemConfig[itemSchema.option?.comType]?.component"
        v-show="itemSchema.option.visible !== false"
        ref="formComList"
        :schemaKey="key"
        :schema="itemSchema"
        :model="model ? model[key] : undefined"
      ></component>
    </template>
  </el-row>
</template>
    
<script setup>
import { ref, toRefs, provide } from 'vue';
import FormItemConfig from './form-item-config.js';

const Ajv = require('ajv');
const ajv = new Ajv();
provide('ajv', ajv);

const props = defineProps({
  /**
   * schema 配置，结构如下:
   * schema: {
                type: 'object', 
                properties: {
                    key: {
                      ...schema, // 基础配置
                      type: '', // 字段的类型
                      label: '', // schema 的中文名称
                      // 字段在不同动态 component 中的相关配置，前缀对应 componentConfig 中的键值
                      // 如: componentConfig.createForm ，这里对应 createFormOption
                      // 字段在 createForm 中相关配置
                      option: {
                          ...elComponentConfig, // 标准 el-conponent 配置
                          comType: '', // 控件类型 input | select | input-number
                          required: false, // 标记那些字段是必填项，默认false
                          visible: true, // 是否展示 (true/false), 默认为 true
                          disable: findLastKey, // 是否禁用 (true/false)，默认 false
                          default: '', // 默认值

                          // comType == select
                          enumList: [], // 枚举列表
                      }
                },
            },
  */
  schema: Object,

  /**
   * model(表单数据
   * 
   */
  model: Object
})

const { schema } = toRefs(props);
const formComList = ref([]);

// 校验表单
const validate = () => {
  return formComList.value.every(component => {
    return component.validate();
  })
}

// 获取表单值
const getValue = () => {
    return formComList.value.reduce((dtoObj,component)=>{
      return {
      ...dtoObj,
      ...component.getValue()
    }
    },{})
}

defineExpose({
  validate,
  getValue
})
</script>
    
<style lang="less">
    .schema-form{
      .form-item{
        margin-bottom: 20px;
        min-width: 500px;

        .item-label{
          margin-right: 15px;
          min-width: 70px;
          text-align: right;
          font-size: 14px;
          color: #fff;
          word-break: break-all;

          .required{
            top: 2px;
            padding-left: 4px;
            color: #f56c6c;
            font-size: 20px;
          }
        }

        .item-value{
          .component{
            width: 320px;
          }

          .valid-border{
            .el-input_wrapper{
              border: 1px solid #f93f3f;
              box-shadow: 0 0 0 0;
            }
            .el-select_wrapper{
              border: 1px solid #f93f3f;
              box-shadow: 0 0 0 0;
            }
          }
        }

        .valid-tips{
          margin-left: 10px;
          height: 36px;
          line-height: 36px;
          overflow: hidden;
          font-size: 12px;
          color: #f93f3f;
        }
      }
    }
</style>