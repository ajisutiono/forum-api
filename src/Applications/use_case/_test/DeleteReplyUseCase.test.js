const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply use case property', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    /** creating dependencies for use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkAvailableReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailableComment)
      .toBeCalledWith({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
      });
    expect(mockReplyRepository.checkAvailableReply)
      .toBeCalledWith({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        replyId: useCasePayload.replyId,
      });
    expect(mockReplyRepository.verifyReplyOwner)
      .toBeCalledWith({
        replyId: useCasePayload.replyId,
        ownerId: useCasePayload.owner,
      });
    expect(mockReplyRepository.deleteReplyById)
      .toBeCalledWith(useCasePayload.replyId);
  });
});
