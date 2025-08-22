import input from './complex-view/input/input.vue';
import inputNumber from './complex-view/input-number/input-number.vue';
import select from './complex-view/select/select.vue';

//  业务拓展 form-item 配置
import BusinessFormItemConfig from '$businessFormItemConfig';

const formItenConfig = {
    input: {
        component: input
    },
    inputNumber: {
        component: inputNumber
    },
    select:{
        component: select
    }
};

export default {
    ...formItenConfig,
    ...BusinessFormItemConfig
};