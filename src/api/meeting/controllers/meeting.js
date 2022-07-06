"use strict";

/**
 *  meeting controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::meeting.meeting", () => ({
  async create(ctx) {
    ctx.request.body.data.host = ctx.state.user;
    const { data, meta } = await super.create(ctx);
    return { data, meta };
  },
}));
