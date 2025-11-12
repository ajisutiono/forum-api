const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let accessToken;
  let userId;

  beforeAll(async () => {
    // Arrange: Create user & get token
    const server = await createServer(container);

    // Register user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Login to get token
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    const { data } = JSON.parse(loginResponse.payload);
    accessToken = data.accessToken;

    // Get userId from database
    const users = await UsersTableTestHelper.findUsersByUsername('dicoding');
    userId = users[0].id;

    // Add thread
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: userId,
      title: 'Thread untuk test like',
    });

    // Add comment
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: userId,
      content: 'Komentar untuk test like',
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should persist like and return 200', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert response
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Assert persistence
      const likesCount = await LikesTableTestHelper.getLikesCount();
      expect(likesCount).toEqual(1);

      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner({
        commentId: 'comment-123',
        owner: userId,
      });
      expect(like.comment_id).toEqual('comment-123');
      expect(like.owner).toEqual(userId);
    });

    it('should remove like (toggle) when user already liked the comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: userId,
      });
      const server = await createServer(container);

      // Action (toggle like → unlike)
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert response
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Assert persistence after unlike
      const likesCount = await LikesTableTestHelper.getLikesCount();
      expect(likesCount).toEqual(0);
    });
  });
});
