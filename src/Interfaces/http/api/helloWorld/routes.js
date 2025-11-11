const routes = (handler) => [
  {
    method: 'GET',
    path: '/hello',
    handler: handler.getHelloWorldHandler,
  },
];

module.exports = routes;
