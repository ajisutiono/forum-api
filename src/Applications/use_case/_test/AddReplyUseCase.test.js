const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply use case correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'reply content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependencies */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking functions */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Perbaikan sesuai intruksi tim review
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })));

    /** creating use case */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.verifyThreadAvailability)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailableComment)
      .toBeCalledWith({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
      });
    expect(mockReplyRepository.addReply).toBeCalledWith(new NewReply({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    }));
  });
});
