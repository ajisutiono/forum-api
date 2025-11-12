const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const NewLike = require('../../../Domains/likes/entities/NewLike');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  const fakeIdGenerator = () => '123';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it('should be instance of LikeRepository', () => {
    const likeRepositoryPostgres = new LikeRepositoryPostgres({}, fakeIdGenerator);
    expect(likeRepositoryPostgres).toBeInstanceOf(LikeRepository);
  });

  describe('checkAvailableLike function', () => {
    it('should return true when like exists', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const newLike = new NewLike({ commentId: 'comment-123', owner: 'user-123' });

      // Action
      const isLiked = await likeRepositoryPostgres.checkAvailableLike(newLike);

      // Assert
      expect(isLiked).toEqual(true);
    });

    it('should return false when like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const newLike = new NewLike({ commentId: 'comment-999', owner: 'user-999' });

      // Action
      const isLiked = await likeRepositoryPostgres.checkAvailableLike(newLike);

      // Assert
      expect(isLiked).toEqual(false);
    });
  });

  describe('addLike function', () => {
    it('should persist like and return NewLike correctly', async () => {
      // Arrange
      const newLike = new NewLike({ commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(newLike);

      // Assert
      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner(newLike);
      expect(like).toBeDefined();
      expect(like.comment_id).toEqual('comment-123');
      expect(like.owner).toEqual('user-123');
    });
  });

  describe('deleteLikeByCommentIdAndOwner function', () => {
    it('should delete existing like without throwing error', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const newLike = new NewLike({ commentId: 'comment-123', owner: 'user-123' });

      // Action & Assert
      await expect(likeRepositoryPostgres.deleteLikeByCommentIdAndOwner(newLike))
        .resolves.not.toThrowError();

      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner(newLike);
      expect(like).toBeUndefined();
    });

    it('should not throw error when deleting non-existing like', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const newLike = new NewLike({ commentId: 'comment-999', owner: 'user-999' });

      await expect(likeRepositoryPostgres.deleteLikeByCommentIdAndOwner(newLike))
        .resolves.not.toThrowError();
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct count when likes exist', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', owner: 'user-456' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(count).toEqual(2);
    });

    it('should return 0 when no likes exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-999');

      // Assert
      expect(count).toEqual(0);
    });
  });
});
