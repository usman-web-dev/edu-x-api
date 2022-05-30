"use strict";
const { merge } = require("lodash");

/**
 *  course-assignment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::course-assignment.course-assignment",
  () => ({
    async find(ctx) {
      ctx.query = merge(ctx.query, {
        filters: {
          section: {
            class: {
              batch: {
                department: {
                  grade: {
                    institute: { id: { $eq: ctx.state.user.institute.id } },
                  },
                },
              },
            },
          },
        },
      });

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },
    async create(ctx) {
      const { data, meta } = await super.create(ctx);

      const chatRoom = await strapi.entityService.create(
        "api::chat-room.chat-room",
        { data: {} }
      );

      console.log(chatRoom);

      await strapi.entityService.update(
        "api::chat-room.chat-room",
        chatRoom.id,
        { data: { course: { id: data.id } } }
      );

      return { data, meta };
    },
  })
);
