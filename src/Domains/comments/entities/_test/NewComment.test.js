const NewComment = require('../NewComment');

describe('a NewComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'some comment',
      threadId: 'thread-123,',
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      threadId: 123,
      owner: 456,
      username: {},
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'some kind of body',
      threadId: 'thread-123',
      owner: 'user-123',
      username: 'Dicoding',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
