const DetailedReply = require('../DetailedReply');

describe('a DetailedReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      // username missing
    };

    // Action & Assert
    expect(() => new DetailedReply(payload))
      .toThrowError('DETAILED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      username: 'dicoding',
    };

    // Action & Assert
    expect(() => new DetailedReply(payload))
      .toThrowError('DETAILED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when isDeleted is not boolean', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      username: 'dicoding',
      isDeleted: 'true',
    };

    // Action & Assert
    expect(() => new DetailedReply(payload))
      .toThrowError('DETAILED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      username: 'dicoding',
    };

    // Action
    const detailedReply = new DetailedReply(payload);

    // Assert
    expect(detailedReply.id).toEqual(payload.id);
    expect(detailedReply.commentId).toEqual(payload.commentId);
    expect(detailedReply.content).toEqual(payload.content);
    expect(detailedReply.date).toEqual(payload.date);
    expect(detailedReply.username).toEqual(payload.username);
  });

  it('should show deleted message when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      username: 'dicoding',
      isDeleted: true,
    };

    // Action
    const detailedReply = new DetailedReply(payload);

    // Assert
    expect(detailedReply.content).toEqual('**balasan telah dihapus**');
  });

  it('should show original content when isDeleted is false', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      date: '2025-08-08T07:22:33.555Z',
      username: 'dicoding',
      isDeleted: false,
    };

    // Action
    const detailedReply = new DetailedReply(payload);

    // Assert
    expect(detailedReply.content).toEqual('sebuah balasan');
  });
});
