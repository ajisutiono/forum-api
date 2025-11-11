const NewReply = require('../NewReply');

describe('a NewReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 234,
      content: {},
      owner: 123,
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object properly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'some reply',
      owner: 'user-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.owner).toEqual(payload.owner);
  });
});
