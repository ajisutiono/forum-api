class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadAvailability(useCasePayload.threadId);

    await this._commentRepository.checkAvailableComment({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });

    await this._replyRepository.checkAvailableReply({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      replyId: useCasePayload.replyId,
    });

    await this._replyRepository.verifyReplyOwner({
      replyId: useCasePayload.replyId,
      ownerId: useCasePayload.owner,
    });

    await this._replyRepository.deleteReplyById(useCasePayload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
