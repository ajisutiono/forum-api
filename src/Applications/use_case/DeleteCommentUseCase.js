class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    await this._commentRepository.checkAvailableComment({ threadId, commentId });
    await this._commentRepository.verifyCommentAccess({ commentId, ownerId: owner });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
