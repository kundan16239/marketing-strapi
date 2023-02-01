'use strict';

/**
 * creator router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::creator.creator', {
    prefix: '',
    only: ['find', 'create'],
    except: [],
    config: {
        find: {},
        create: {},
    }
});