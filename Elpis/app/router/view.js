module.exports =(app,router)=>{
    // 由于在 controllerLoader 文件中已经将所有的 controller 文件挂载到app上，因此可以直接通过 app.controller 获取
    const { view: viewController} = app.controller;
    
    // 当用户输入 http://ip:root/view/xxx 就能渲染出对应的页面
    router.get('/view/:page', viewController.renderPage.bind(viewController));
    // 当用户输入 http://ip:root/view/xxx/xxx 就能渲染出对应的页面
    router.get('/view/:page/*', viewController.renderPage.bind(viewController));
}