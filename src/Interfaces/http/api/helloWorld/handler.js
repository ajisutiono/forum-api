class HelloWorldHandler {
  constructor() {
    this.getHelloWorldHandler = this.getHelloWorldHandler.bind(this);
  }

  getHelloWorldHandler(request, h) {
    return h.response({
      status: 'success',
      message: 'Hello World!',
    });
  }
}

module.exports = HelloWorldHandler;
