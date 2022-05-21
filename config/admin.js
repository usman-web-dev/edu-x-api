module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'a5e6c3f16f5624a2eac0c3732914797b'),
  },
});
