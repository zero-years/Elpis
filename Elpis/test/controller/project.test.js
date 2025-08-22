const assert = require('assert');
const supertest = require('supertest');
const md5 = require('md5');
const elpiseCore = require('../../elpis-core');

const signKey = 'zyear1api2key';
const st = Date.now();

describe('测试 project 接口', function(){
    this.timeout(60000);

    let modelList;
    const projectList = [];

    let request;

    // 启动虚拟服务
    it('启动服务', async ()=>{
        const app = await elpiseCore.start();
        modelList = require('../../model/index.js')(app);
        modelList.forEach(modelItem =>{
            const { project } = modelItem;
            for(const pkey in project){
                projectList.push(project[pkey]);
            }
        })
        request = supertest(app.listen());
    });

    // 想要测试的方法
    // 获取项目配置
    it('GET /api/project without proj_key', async()=>{
        let temRequest = request.get('/api/project');
        temRequest = temRequest.set('s_t', st);
        temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
        const res = await temRequest;
        assert(res.body.success === false);

        const resBody = res.body;
        assert(resBody.code === 442);
        assert(resBody.message.indexOf("request validate fail: data should have required property 'proj_key'") >-1);
    });

    it('GET /api/project fail', async()=>{
        let temRequest = request.get('/api/project');
        temRequest = temRequest.set('s_t', st);
        temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
        temRequest = temRequest.query({
            proj_key: 'xxxxx'
        })
        const res = await temRequest;
        assert(res.body.success === false);

        const resBody = res.body; 
        assert(resBody.code === 50000);
        assert(resBody.message === '获取项目异常');
    });

    it('GET /api/project with proj_key', async()=>{
        for(let i = 0;i < projectList.length; i++){
            const projItem = projectList[i];
            const { key: projKey } = projItem;
            console.log(`----- GET /api/project witn projKey: ${projKey}`)

            let temRequest = request.get('/api/project');
            temRequest = temRequest.set('s_t', st);
            temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
            temRequest = temRequest.query({
                proj_key: projKey
            })
            const res = await temRequest;
            assert(res.body.success === true);   

            const resData = res.body.data;
            assert(resData.key === projKey);
            assert(resData.modelKey);
            assert(resData.name);
            assert(resData.homePage !== undefined);
            assert(resData.desc !== undefined);

            const { menu } = resData;
            menu.forEach(menuItem =>{
                checkMenuItem(menuItem)
            });
        }

        // 校验 menu 菜单函数
        function checkMenuItem(menuItem){
            console.log(`----- GET /api/project witn projKey -- menuKey: ${menuItem.key}`)
            assert(menuItem.key);
            assert(menuItem.name);
            assert(menuItem.menuType); 

            if(menuItem.menuType === 'group'){
                assert(menuItem.subMenu !== undefined);
                menuItem.subMenu.forEach(subMenuItem =>{
                    checkModule(subMenuItem);
                })
            }
            if(menuItem.menuType === 'module'){
                checkModule(menuItem);
            }
        }

        // 递归校验类型为 module 的菜单配置
        function checkModule(menuItem){
            const { moduleType } = menuItem;

            if(moduleType === 'sider'){
                const { siderConfig } = menuItem;
                assert(siderConfig);
                assert(siderConfig.menu);
                siderConfig.menu.forEach(siderConfigItem =>{
                    checkMenuItem(siderConfigItem);
                })
            }
            if(moduleType === 'iframe'){
                const { iframeConfig } = menuItem;
                assert(iframeConfig);
                assert(iframeConfig.path !== undefined)
            }
            if(moduleType === 'custom'){
                const { customConfig } = menuItem;
                assert(customConfig);
                assert(customConfig.path !== undefined)
            }
            if(moduleType === 'schema'){
                const { schemaConfig } = menuItem;
                assert(schemaConfig);
                assert(schemaConfig.api !== undefined);
                assert(schemaConfig.schema);
            }
        }
    });

    // 不携带 projKey 的获取项目列表的方法
    it('GET /api/project/list without proj_key', async ()=>{
        let temRequest = request.get('/api/project/list');
        temRequest = temRequest.set('s_t', st);
        temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
        const res = await temRequest;
        assert(res.body.success === true);

        const resData = res.body.data;
        // 判断长度是否与原先的 projectList 一致
        assert(resData.length === projectList.length);
        for( let i =0; i< resData.length; i++){
            // 判断 modelKey, key, name, desc, homePage 是否存在 
            const item = resData[i];
            assert(item.modelKey);
            assert(item.key);
            assert(item.name);
            assert(item.desc !== undefined);
            assert(item.homePage !== undefined);
        }
    })
    
    // 携带 projKey 的请求
    it('GET /api/project/list with proj_key', async ()=>{
        const { key:projkey } = projectList[Math.floor(Math.random() * projectList.length)];
        const { modelKey } = projectList.find(item => item.key === projkey);

        let temRequest = request.get('/api/project/list');
        temRequest = temRequest.set('s_t', st);
        temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
        temRequest = temRequest.query({
            proj_key: projkey
        })
        const res = await temRequest;
        assert(res.body.success === true);

        const resData = res.body.data;
        assert(projectList.filter(item => item.modelKey === modelKey).length === resData.length)
    })

    it('GET /api/project/model_list', async ()=>{
        let temRequest = request.get('/api/project/model_list');
        temRequest = temRequest.set('s_t', st);
        temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
        const res = await temRequest;
        assert(res.body.success === true);

        const resData = res.body.data;
        assert(resData.length > 0);

        for(let i = 0; i< resData.length; i++){
            const item = resData[i];
            assert(item.model);
            assert(item.model.key);
            assert(item.model.name);
            assert(item.project);
            for(const projKey in item.project){
                assert(item.project[projKey].key);
                assert(item.project[projKey].name);
            }
        }
    });
});