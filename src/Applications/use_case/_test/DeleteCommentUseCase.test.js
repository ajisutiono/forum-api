const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment use case properly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /* creating dependencies for use case */
    const mockCommentRepository = new CommentRepository();

    /* mocking needed functions sesuai method baru */
    mockCommentRepository.checkAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.checkAvailableComment)
      .toBeCalledWith({ threadId: useCasePayload.threadId, commentId: useCasePayload.commentId });
    expect(mockCommentRepository.verifyCommentAccess)
      .toBeCalledWith({ commentId: useCasePayload.commentId, ownerId: useCasePayload.owner });
    expect(mockCommentRepository.deleteCommentById)
      .toBeCalledWith(useCasePayload.commentId);
  });
});
