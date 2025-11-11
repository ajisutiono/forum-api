class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance('AddThreadUseCase');

    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
      data: {
        addedThread,
      },
    }).code(201);
  }

  async getThreadByIdHandler(request, h) {
    const getThreadUseCase = this._container.getInstance('GetThreadUseCase');
    const { threadId } = request.params;
    const thread = await getThreadUseCase.execute({ threadId });

    return h.response({
      status: 'success',
      data: {
        thread,
      },
    }).code(200);
  }
}

module.exports = ThreadsHandler;
