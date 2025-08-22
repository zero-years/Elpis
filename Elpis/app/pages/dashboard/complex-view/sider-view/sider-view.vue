<template>
  <sider-container>
    <template #menu-content>
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        @select="onMenuSelect" 
      >
        <template v-for="item in menuList">
          <!-- group -->
          <sub-menu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          ></sub-menu>
          <!-- module -->
          <el-menu-item
            v-else
            :index="item.key"
          >
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template>
    <template #main-content>
      <router-view></router-view>
    </template>
  </sider-container>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMenuStore } from '$elpisStore/menu.js';
  import SiderContainer from '$elpisWidgets/sider-container/sider-container.vue';
  import SubMenu from './complex-view/sub-menu/sub-menu.vue';

  const route = useRoute();
  const router = useRouter();
  const menuStore = useMenuStore();

  const activeKey = ref('');
  const setActiveKey = function () {
    let siderMenuItem = menuStore.findMenuItem({
      key:'key',
      value:route.query.sider_key
    });  

    // 首次加载 sider-view, 用户没有点击左侧菜单，需要给一个默认的 sider_key 去到默认的菜单选中
    if(!siderMenuItem){
      const hrMenuItem  = menuStore.findMenuItem({
        key:'key',
        value:route.query.key
      }); 
      if(hrMenuItem && hrMenuItem.siderConfig && hrMenuItem.siderConfig.menu){
        const siderMenuList = hrMenuItem.siderConfig.menu;
        siderMenuItem = menuStore.findFirstMemnuItem(siderMenuList);
        if(siderMenuItem){
          // TODO: 处理选中菜单逻辑
          handleMenuSelect(siderMenuItem.key)
        }
      }
    }

    activeKey.value = siderMenuItem?.key;
  }

  const menuList = ref([]);
  const setMenuList = function () {
    const menuItem = menuStore.findMenuItem({
      key: 'key',
      value:route.query.key
    });
    if(menuItem && menuItem.siderConfig && menuItem.siderConfig.menu) {
      menuList.value = menuItem.siderConfig.menu;
    }
  }

  watch([
    () => route.query.key,
    () => menuStore.menuList
  ], () => {
    setMenuList();
    setActiveKey();
  }, { deep: true })
  
  onMounted(()=>{
    setMenuList();
    setActiveKey();
  })

  const onMenuSelect = function (menuKey) {
    // TODO: 处理选中菜单逻辑
    handleMenuSelect(menuKey);
  }

  const handleMenuSelect = function(menuKey){
    const menuItem = menuStore.findMenuItem({
      key: 'key',
      value: menuKey
    });

    const { moduleType, key, customConfig } = menuItem;

    // 点击为当前页面，不处理
    if(key === route.query.sider_key){ return };

    const pathMap = {
      iframe: '/iframe',
      schema: '/schema',
      custom: customConfig?.path
    }

    router.push({
      path: `/view/dashboard/sider${pathMap[moduleType]}`,
      query:{
        key: route.query.key,
        sider_key: key,
        proj_key: route.query.proj_key
      }
    })
  }
</script>

<style lang="less" scoped>

</style>