'use strict';

/**
 * company router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::company.company', {
    prefix: '',
    only: ['find', 'create'],
    except: [],
    config: {
        find: {},
        create: {},
    }
});