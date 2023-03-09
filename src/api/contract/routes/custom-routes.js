'use strict';

module.exports = {
    routes: [{
        method: 'GET',
        path: '/allcontract',
        handler: 'api::contract.contract.getAllContract',
    }]
};