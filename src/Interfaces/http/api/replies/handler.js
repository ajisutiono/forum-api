class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance('AddReplyUseCase');

    const addedReply = await addReplyUseCase.execute({
      ...request.payload,
      threadId,
      commentId,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async deleteReplyHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance('DeleteReplyUseCase');

    await deleteReplyUseCase.execute({
      threadId,
      commentId,
      replyId,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
    }).code(200);
  }
}

module.exports = RepliesHandler;
