'use strict';

/**
 * youtube service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::youtube.youtube');
