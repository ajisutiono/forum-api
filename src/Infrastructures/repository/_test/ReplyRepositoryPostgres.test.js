const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ReplyRepository domain', () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    // Action & Assert
    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'SomeUser' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addReply function', () => {
      it('addReply function should add reply in database', async () => {
        // Arrange
        const newReply = new NewReply({
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'some reply',
        });

        const fakeIdGenerator = () => '123';
        class fakeDateGenerator {
          constructor() {
            this.toISOString = () => '2025-12-12T12:12:12.123Z';
          }
        }
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(
          pool, fakeIdGenerator, fakeDateGenerator,
        );

        // Action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);
        const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);

        // Assert
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: newReply.content,
          owner: newReply.owner,
        }));
        expect(reply).toHaveLength(1);
      });
    });

    describe('checkAvailableReply function', () => {
      it('should not throw error if reply available', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});

        // Action & Assert
        await expect(replyRepositoryPostgres.checkAvailableReply({
          threadId: 'thread-123',
          commentId: 'comment-123',
          replyId: 'reply-123',
        })).resolves.not.toThrow();
      });

      it('should throw error if reply does not available', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.checkAvailableReply({
          threadId: 'thread-123',
          commentId: 'comment-123',
          replyId: 'reply-789',
        })).rejects.toThrowError(NotFoundError);
      });
    });

    describe('verifyReplyOwner function', () => {
      it('should not throw error when user has access', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
        await RepliesTableTestHelper.addReply({});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyReplyOwner({
          ownerId: 'user-123',
          replyId: 'reply-123',
        })).resolves.not.toThrow();
      });

      it('should throw error when user does not have access', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
        await RepliesTableTestHelper.addReply({});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyReplyOwner({
          ownerId: 'user-456',
          replyId: 'reply-123',
        })).rejects.toThrowError(AuthorizationError);
      });
    });

    describe('getRepliesByThreadId', () => {
      it('should return replies as plain objects with is_deleted field', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'A reply content',
          isDeleted: false,
        });

        // Action
        const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

        // Assert
        expect(replies).toHaveLength(1);
        expect(replies[0].id).toBe('reply-123');
        expect(replies[0].content).toBe('A reply content');
        expect(replies[0].is_deleted).toBe(false);
        expect(replies[0].comment_id).toBe('comment-123');
        // Tambahn assert untuk properti tambahan yang disarankan tim review
        expect(replies[0].date).toBeDefined();
        expect(replies[0].username).toBe('SomeUser');
      });

      it('should return deleted replies with is_deleted true', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({
          id: 'reply-456',
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'A reply content',
          isDeleted: true,
        });

        // Action
        const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

        // Assert
        expect(replies).toHaveLength(1);
        expect(replies[0].content).toBe('A reply content');
        expect(replies[0].is_deleted).toBe(true);
        // Tambahn assert untuk properti tambahan yang disarankan tim review
        expect(replies[0].id).toBe('reply-456');
        expect(replies[0].comment_id).toBe('comment-123');
        expect(replies[0].date).toBeDefined();
        expect(replies[0].username).toBe('SomeUser');
      });
    });

    describe('deleteReplyById function', () => {
      it('should not throw error when reply deleted successfully', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
        await RepliesTableTestHelper.addReply({});
        // Action & Assert
        await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
          .resolves.not.toThrow();
      });

      it('deleted reply should have is_deleted column as true in database', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
        await RepliesTableTestHelper.addReply({});
        await replyRepositoryPostgres.deleteReplyById('reply-123');

        // Action
        const reply = await RepliesTableTestHelper.findReplyById('reply-123');

        // Assert
        expect(reply[0].is_deleted).toEqual(true);
      });

      it('should throw error when reply has been already deleted', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
          .rejects.toThrowError(NotFoundError);
      });
    });
  });
});
