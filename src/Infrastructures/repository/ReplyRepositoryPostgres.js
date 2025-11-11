// src/Infrastructures/repository/ReplyRepositoryPostgres.js

const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addReply(newReply) {
    const {
      commentId, owner, content,
    } = newReply;
    const id = `reply-${this._idGenerator(10)}`;
    const date = new this._dateGenerator().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, owner, content, date],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.comment_id, replies.content, replies.date, 
             users.username, replies.is_deleted
             FROM replies
             INNER JOIN comments ON replies.comment_id = comments.id
             INNER JOIN users ON replies.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async checkAvailableReply({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT 1 
      FROM replies
      INNER JOIN comments ON replies.comment_id = comments.id
      WHERE replies.id = $1
      AND replies.comment_id = $2
      AND comments.thread_id = $3
      AND replies.is_deleted = false`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply yang Anda cari tidak ada');
    }
  }

  async verifyReplyOwner({ ownerId, replyId }) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE owner = $1 AND id = $2',
      values: [ownerId, replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak melakukan aksi tersebut pada reply ini');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id=$1 AND is_deleted=FALSE RETURNING id',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply yang ingin Anda hapus tidak ada');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
