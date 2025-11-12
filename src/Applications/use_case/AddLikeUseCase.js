const NewLike = require('../../Domains/likes/entities/NewLike');

class AddLikeUseCase {
  constructor({ commentRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._commentRepository.checkAvailableComment({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });

    const newLike = new NewLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });

    const isLikeExist = await this._likeRepository.checkAvailableLike(newLike);
    if (isLikeExist) {
      await this._likeRepository.deleteLikeByCommentIdAndOwner(newLike);
    } else {
      await this._likeRepository.addLike(newLike);
    }
  }
}

module.exports = AddLikeUseCase;
