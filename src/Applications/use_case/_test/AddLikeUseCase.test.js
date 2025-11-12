const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewLike = require('../../../Domains/likes/entities/NewLike');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should add like when not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();

    mockLikeRepository.checkAvailableLike = jest.fn().mockResolvedValue(false);
    mockLikeRepository.addLike = jest.fn().mockResolvedValue();
    mockCommentRepository.checkAvailableComment = jest.fn().mockResolvedValue();

    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCasePayload);

    // Assert
    const expectedNewLike = new NewLike({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    expect(mockCommentRepository.checkAvailableComment)
      .toBeCalledWith({ threadId: 'thread-123', commentId: 'comment-123' });
    expect(mockLikeRepository.checkAvailableLike)
      .toBeCalledWith(expectedNewLike);
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(expectedNewLike);
  });

  it('should remove like when already exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();

    mockLikeRepository.checkAvailableLike = jest.fn().mockResolvedValue(true);
    mockLikeRepository.deleteLikeByCommentIdAndOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.checkAvailableComment = jest.fn().mockResolvedValue();

    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCasePayload);

    // Assert
    const expectedNewLike = new NewLike({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    expect(mockCommentRepository.checkAvailableComment)
      .toBeCalledWith({ threadId: 'thread-123', commentId: 'comment-123' });
    expect(mockLikeRepository.checkAvailableLike)
      .toBeCalledWith(expectedNewLike);
    expect(mockLikeRepository.deleteLikeByCommentIdAndOwner)
      .toBeCalledWith(expectedNewLike);
  });
});
