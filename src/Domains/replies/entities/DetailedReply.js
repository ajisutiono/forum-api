// src/Domains/replies/entities/DetailedReply.js
class DetailedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      commentId,
      content,
      date,
      username,
      isDeleted = false,
    } = payload;

    this.id = id;
    this.commentId = commentId;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAILED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAILED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, commentId, content, date, username,
  }) {
    return !id || !commentId || !content || !date || !username;
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, commentId, content, date, username, isDeleted,
  }) {
    if (isDeleted !== undefined && typeof isDeleted !== 'boolean') {
      return true;
    }

    return (
      typeof id !== 'string'
      || typeof commentId !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
    );
  }
}

module.exports = DetailedReply;
