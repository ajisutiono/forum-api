const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'SomeUser' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    });
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addComment function', () => {
      it('addComment function should add database entry for said comment', async () => {
        // Arrange
        const newComment = new NewComment({
          content: 'some content',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        const fakeIdGenerator = () => '123';
        class fakeDateGenerator {
          constructor() {
            this.toISOString = () => '2025-12-12T12:12:12.123Z';
          }
        }
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, fakeIdGenerator, fakeDateGenerator,
        );

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);
        const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        }));
        expect(comments).toBeDefined();
        expect(comments).toHaveLength(1);
      });
    });

    describe('deleteCommentById', () => {
      it('should be able to delete added comment by id', async () => {
        // Arrange
        const addedComment = {
          id: 'comment-123',
          threadId: 'thread-123',
        };

        await CommentsTableTestHelper.addComment({
          id: addedComment.id, threadId: addedComment.threadId,
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        // Action
        await commentRepositoryPostgres.deleteCommentById(addedComment.id);
        const comments = await CommentsTableTestHelper.findCommentById('comment-123');

        // Assert
        expect(comments).toHaveLength(1);
        expect(comments[0].is_deleted).toEqual(true);
      });

      it('should throw error when comment that wants to be deleted does not exist', async () => {
        // Arrange
        const addedCommentId = 'comment-123';

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.deleteCommentById(addedCommentId)).rejects.toThrowError(NotFoundError);
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should return all comments from a thread', async () => {
        // Arrange
        const firstComment = {
          id: 'comment-123', date: '2020', content: 'first comment', is_deleted: false,
        };
        const secondComment = {
          id: 'comment-456', date: '2022', content: 'second comment', is_deleted: false,
        };
        await CommentsTableTestHelper.addComment(firstComment);
        await CommentsTableTestHelper.addComment(secondComment);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        // Action
        const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(commentDetails).toEqual([
          { ...firstComment, username: 'SomeUser' },
          { ...secondComment, username: 'SomeUser' },
        ]);
      });

      it('should return comments with is_deleted flag', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'a comment',
          isDeleted: true,
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        // Action
        const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(comments[0].is_deleted).toBe(true);
        expect(comments[0].content).toBe('a comment');
      });

      it('should return an empty array when no comments exist for the thread', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        // Action & Assert
        const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
        expect(commentDetails).toStrictEqual([]);
      });
    });

    describe('checkAvailableComment', () => {
      it('should resolve if comment available', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailableComment({ threadId: 'thread-123', commentId: 'comment-123' }))
          .resolves.not.toThrow();
      });

      it('should reject if comment does not exist', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailableComment({ threadId: 'thread-123', commentId: 'comment-456' }))
          .rejects.toThrowError(NotFoundError);
      });

      it('should reject if comment is already deleted', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          isDeleted: true,
        });

        // Action & Assert
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        await expect(commentRepositoryPostgres.checkAvailableComment({ threadId: 'thread-123', commentId: 'comment-456' }))
          .rejects.toThrowError(NotFoundError);
      });
    });

    describe('verifyCommentAccess', () => {
      it('should not throw error if user has authorization', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentAccess({
          commentId: 'comment-123', ownerId: 'user-123',
        })).resolves.not.toThrow();
      });

      it('should throw error if user has no authorization', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({ id: 'thread-xyz' });
        await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });

        // Action & Assert
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {}, {},
        );
        await expect(commentRepositoryPostgres.verifyCommentAccess({
          threadId: 'thread-123', owner: 'user-456',
        })).rejects.toThrowError(AuthorizationError);
      });
    });
  });
});
