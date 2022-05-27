'use strict';

/**
 * attendance-student service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::attendance-student.attendance-student');
