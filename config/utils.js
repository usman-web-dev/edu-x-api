module.exports = () => ({
  sanitizeUser(user, addInAttributes = true) {
    const {
      id,
      password,
      resetPasswordToken,
      confirmationToken,
      ...sanitizedUser
    } = user;

    return {
      id,
      ...(addInAttributes ? { attributes: sanitizedUser } : sanitizedUser),
    };
  },

  CONNECTED_SOCKETS: {},

  async getSocketUser(socket) {
    const {
      handshake: {
        headers: { authorization },
      },
    } = socket;

    const getService = (name) =>
      strapi.plugin("users-permissions").service(name);

    const jwtService = getService("jwt");
    const userService = getService("user");

    if (!authorization || authorization.length < 30) {
      throw new Error("Bearer token missing or malformed.");
    }

    const authToken = authorization.slice(7);
    const { id } = await jwtService.verify(authToken);

    const userSocket = this.CONNECTED_SOCKETS[id];

    let user = userSocket?.user;
    if (!user) {
      user = this.sanitizeUser(await userService.fetch({ id }), false);
    }

    if (userSocket?.socket && userSocket.socket.id !== socket.id) {
      userSocket.socket.disconnect();
    }

    this.CONNECTED_SOCKETS[id] = {
      user,
      socket,
    };

    socket.data._user = user;

    return user;
  },
});
