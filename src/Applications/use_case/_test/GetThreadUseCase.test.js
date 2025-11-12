const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const DetailedThread = require('../../../Domains/threads/entities/DetailedThread');
const DetailedComment = require('../../../Domains/comments/entities/DetailedComment');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    // --- Mock repositories ---
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'some thread title',
        body: 'some thread body',
        date: '2025',
        username: 'dicoding',
      });

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([
        {
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: 'comment A',
          is_deleted: false,
        },
        {
          id: 'comment-456',
          username: 'user B',
          date: '2025',
          content: 'comment B',
          is_deleted: false,
        },
      ]);

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockResolvedValue([
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'reply A',
          date: '2026',
          username: 'user C',
          is_deleted: false,
        },
        {
          id: 'reply-456',
          comment_id: 'comment-456',
          content: 'reply B',
          date: '2026',
          username: 'user D',
          is_deleted: false,
        },
      ]);

    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-123') return Promise.resolve(5);
        if (commentId === 'comment-456') return Promise.resolve(3);
        return Promise.resolve(0);
      });

    const getThreadDetailedUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const useCaseResult = await getThreadDetailedUseCase.execute(useCaseParam);

    // Assert
    expect(useCaseResult).toEqual(new DetailedThread({
      id: 'thread-123',
      title: 'some thread title',
      body: 'some thread body',
      date: '2025',
      username: 'dicoding',
      comments: [
        new DetailedComment({
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: 'comment A',
          likeCount: 5,
          replies: [{
            id: 'reply-123',
            content: 'reply A',
            date: '2026',
            username: 'user C',
          }],
        }),
        new DetailedComment({
          id: 'comment-456',
          username: 'user B',
          date: '2025',
          content: 'comment B',
          likeCount: 3,
          replies: [{
            id: 'reply-456',
            content: 'reply B',
            date: '2026',
            username: 'user D',
          }],
        }),
      ],
    }));

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockLikeRepository.getLikeCountByCommentId).toBeCalledTimes(2);
  });

  it('should show deleted message when comment is deleted', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'some thread title',
        body: 'some thread body',
        date: '2025',
        username: 'dicoding',
      });

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([
        {
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: 'original comment content',
          is_deleted: true,
        },
      ]);

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockResolvedValue([]);

    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    const getThreadDetailedUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const result = await getThreadDetailedUseCase.execute(useCaseParam);

    // Assert
    expect(result).toStrictEqual(new DetailedThread({
      id: 'thread-123',
      title: 'some thread title',
      body: 'some thread body',
      date: '2025',
      username: 'dicoding',
      comments: [
        new DetailedComment({
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        }),
      ],
    }));
  });

  it('should show deleted message for deleted replies', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue({
        id: 'thread-123',
        title: 'some thread title',
        body: 'some thread body',
        date: '2025',
        username: 'dicoding',
      });

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([
        {
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: 'comment A',
          is_deleted: false,
        },
      ]);

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockResolvedValue([
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'original reply content',
          date: '2026',
          username: 'user C',
          is_deleted: true,
        },
      ]);

    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(10));

    const getThreadDetailedUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const result = await getThreadDetailedUseCase.execute(useCaseParam);

    // Assert
    expect(result).toStrictEqual(new DetailedThread({
      id: 'thread-123',
      title: 'some thread title',
      body: 'some thread body',
      date: '2025',
      username: 'dicoding',
      comments: [
        new DetailedComment({
          id: 'comment-123',
          username: 'user A',
          date: '2026',
          content: 'comment A',
          likeCount: 10,
          replies: [{
            id: 'reply-123',
            content: '**balasan telah dihapus**',
            date: '2026',
            username: 'user C',
          }],
        }),
      ],
    }));
  });
});
