class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance('AddCommentUseCase');

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  }

  async deleteCommentHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance('DeleteCommentUseCase');

    await deleteCommentUseCase.execute({
      threadId,
      commentId,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
    }).code(200);
  }
}

module.exports = CommentsHandler;
