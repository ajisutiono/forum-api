const DetailThread = require('../DetailedThread');

describe('an AddedThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A sample thread',
      body: 'This is a sample body',
      date: '2024-06-01',
      username: 'user-123',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAILED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: {},
      date: 20240601,
      username: [],
      comments: 'This is a comment',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAILED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A sample thread',
      body: 'This is a sample body',
      date: '2024-06-01',
      username: 'user-123',
      comments: [],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new DetailThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
