const HelloWorldHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'helloWorld',
  register: async (server) => {
    const handler = new HelloWorldHandler();
    server.route(routes(handler));
  },
};
