module.exports = {
    '/api/proj/product/list': {
        get: {
            query: {
                type: 'object',
                properties: {
                    page: {
                        type: 'string'
                    },
                    size: {
                        type: 'string'
                    },
                },
                required: [ 'page', 'size']
            }
        }
    },
    '/api/proj/product': {
        delete: {
            body: {
                type: 'object',
                properties: {
                    product_id: {
                        type: 'string'
                    }
                },
                required: [ 'product_id'] 
            }
        },
        post: {
            body: {
                type: 'object',
                properties: {
                    product_name: {
                        type:'string'
                    },
                    price: {
                        type:'number'
                    },
                    inventory: {
                        type:'number'
                    },
                },
                required: ['product_name']
            }
        },
        put: {
            body: {
                type: 'object',
                properties: {
                    product_id: {
                        type: 'string'
                    },
                    product_name: {
                        type: 'string'
                    },
                    price: {
                        type: 'number'
                    },
                    inventory: {
                        type: 'number'
                    }
                },
                required: ['product_id', 'product_name']
            }
        },
        get: {
            query: {
                type: 'object',
                properties: {
                    product_id: {
                        type: 'string',
                    }
                },
                required: ['product_id']
            }
        }
    },
    '/api/proj/product_enum/list': {
        get: {
            
        }
    }
}