'use strict';

module.exports = {
    routes: [{
            method: 'POST',
            path: '/filter',
            handler: 'api::company.company.postFilter',
            // config: {
            //     auth: false,
            //     policies: [],
            //     middlewares: [],
            // }
        },
        {
            method: 'GET',
            path: '/filtercount',
            handler: 'api::company.company.getFilterNumber',
            // config: {
            //     auth: false,
            //     policies: [],
            //     middlewares: [],
            // },
        }
    ]
};