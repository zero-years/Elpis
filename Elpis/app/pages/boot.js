  import { createApp } from 'vue';

// 引入 elementUI 
  import ElementUI from 'element-plus';
  import 'element-plus/theme-chalk/index.css';
  import 'element-plus/theme-chalk/dark/css-vars.css'

// 引入 custom 样式
  import './asserts/custom.css';

// 引入 pinia
  import pinia from '$elpisStore';

// 引入页面路由
  import { createRouter, createWebHistory } from 'vue-router';
/**
 * vue 页面主入口，用于启动(初始化) vue
 * @param pageComponent vue 入口组件
 * @param routes 路由列表
 * @param libs 页面所依赖的第三方依赖包
 */
export default (pageComponent,{routes ,libs} = {}) =>{
    const app = createApp(pageComponent);
    // 使用 elementUI
    app.use(ElementUI);

    // 引入 pinia
    app.use(pinia);
    // 将第三方依赖包进行挂载
    if(libs && libs.length ){
        for(let i = 0; i < libs.length ; i++){
            app.use(libs[i]);
        }
    }

    // 引入页面路由(且增加健壮性代码)
    if(routes && routes.length){
        const router = createRouter({
            history: createWebHistory(), 
            routes
        })
        app.use(router);
        router.isReady().then(()=>{
            app.mount('#root');
        })
    }else{
        // 将组件挂载到 root 上
        app.mount('#root');
    }
}