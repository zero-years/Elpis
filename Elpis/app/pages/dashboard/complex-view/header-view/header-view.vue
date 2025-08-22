<template>
  <header-container :title="projName">
    <!-- 根据 menuStore.menuList 渲染-->
    <template #menu-content>
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        mode="horizontal"
        @select="onMenuSelect"
      >
        <template v-for="item in menuStore.menuList" :key="item.key">
          <sub-menu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          ></sub-menu>
          <el-menu-item v-else :index="item.key">
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <template #setting-content>
      <!-- 根据 projectStore.projectList 渲染 -->
      <el-dropdown @command="handleProjectCommand">
        <span class="project-list">
          {{ projName }}
          <el-icon v-if="projectStore.projectList.length > 1" class="el-icon--right">
            <ArrowDown></ArrowDown>
          </el-icon>
        </span>
        <template v-if="projectStore.projectList.length > 1" #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="item in projectStore.projectList" 
              :key="item.key"
              :command="item.key"
              :disabled="item.name === projName"
            >
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <template #main-content>
      <slot name="main-content"></slot>
    </template>
  </header-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import HeaderContainer from '$elpisWidgets/header-container/header-container.vue'
import { useMenuStore } from '$elpisStore/menu.js';
import { useProjectStore } from '$elpisStore/project.js';
import SubMenu from './complex-view/sub-menu/sub-menu.vue';

defineProps({
    projName: String
})

const menuStore = useMenuStore();
const projectStore = useProjectStore();
const route = useRoute();

const activeKey = ref('');

const $emit = defineEmits([ 'menu-selcet' ])

// 监听 key 是否变化，变化则调用 setActiveKey
watch(()=> route.query.key, ()=>{
  setActiveKey();
},{ deep: true })

// 监听 key 是否变化，变化则调用 setActiveKey
watch(()=> menuStore.menuList, ()=>{
  setActiveKey();
},{ deep: true })
// 页面挂载时需要调用 setActiveKey
onMounted(()=>{
  setActiveKey();
})

const setActiveKey = function(){
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key
  });
  activeKey.value = menuItem?.key;
}

const onMenuSelect = function(menuKey){
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: menuKey
  });
  $emit('menu-select', menuItem);
} 
const handleProjectCommand = function(event){
  const projectItem = projectStore.projectList.find(item => item.key === event);
  if( !projectItem || !projectItem.homePage) { return }
  const { host } = window.location;
  window.location.replace(`http://${host}/view/dashboard${projectItem.homePage}`)
}

</script>

<style scoped lang="less">
:deep(.el-menu--horizontal.el-menu) {
  border-bottom: 0;
}
.project-list{
  margin-right: 20px;
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}
</style>