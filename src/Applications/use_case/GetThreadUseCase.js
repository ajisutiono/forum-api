const DetailedThread = require('../../Domains/threads/entities/DetailedThread');
const DetailedComment = require('../../Domains/comments/entities/DetailedComment');
const DetailedReply = require('../../Domains/replies/entities/DetailedReply');

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    await this._threadRepository.verifyThreadAvailability(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const detailedReplies = replies.map((reply) => ({
      id: reply.id,
      commentId: reply.comment_id,
      content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
      date: reply.date,
      username: reply.username,
    }));

    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const commentReplies = detailedReplies
        .filter((reply) => reply.commentId === comment.id)
        .map(({ commentId, ...reply }) => reply);

      const likeCount = await this._likeRepository.getLikeCountByCommentId(comment.id);

      return new DetailedComment({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
        replies: commentReplies,
        likeCount,
      });
    }));

    return new DetailedThread({
      ...thread,
      comments: commentsWithReplies,
    });
  }
}

module.exports = GetThreadUseCase;
