const AddedComment = require('../AddedComment');

describe('a AddedComment entity', () => {
  it('should throw error when payload not contain neede property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'some comment',
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 145,
      owner: {},
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'somekind content',
      owner: 'user-123',
    };
    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
