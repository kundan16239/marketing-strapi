'use strict';

/**
 * instagram service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::instagram.instagram');
