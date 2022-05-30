"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const { Server } = require("socket.io");

    const io = new Server(strapi.server.httpServer, {
      cors: { origin: "*" },
    });

    io.use(async (socket, next) => {
      try {
        await strapi.config.utils.getSocketUser(socket);
        next();
      } catch (e) {
        next(e);
      }
    });

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.data._user.id}`);
      socket.on("disconnect", () =>
        console.log(`User disconnected: ${socket.data._user.id}`)
      );
    });
    strapi.io = io;
  },
};
