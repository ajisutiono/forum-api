const DetailedComment = require('../DetailedComment');

describe('a DetailComment entity', () => {
  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'some comment',
      date: 'thread-123,',
      content: 'some comment',
      replies: [],
    };

    // Action
    const detailedComment = new DetailedComment(payload);

    // Assert
    expect(detailedComment.id).toEqual(payload.id);
    expect(detailedComment.username).toEqual(payload.username);
    expect(detailedComment.date).toEqual(payload.date);
    expect(detailedComment.content).toEqual(payload.content);
    expect(detailedComment.replies).toEqual(payload.replies);
  });

  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'some comment',
      date: 'thread-123,',
    };

    // Action & Assert
    expect(() => new DetailedComment(payload)).toThrowError('DETAILED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: {},
      date: 2021,
      content: { content: 'some content' },
      replies: 'replies',
    };

    // Action & Assert
    expect(() => new DetailedComment(payload)).toThrowError('DETAILED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
