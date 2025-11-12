const LikeRepository = require('../../Domains/likes/LikeRepository');
const NewLike = require('../../Domains/likes/entities/NewLike');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkAvailableLike(newLike) {
    const query = {
      text: 'SELECT 1 FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [newLike.commentId, newLike.owner],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async addLike(newLike) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes (id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [id, newLike.commentId, newLike.owner],
    };
    await this._pool.query(query);
    return new NewLike({ commentId: newLike.commentId, owner: newLike.owner });
  }

  async deleteLikeByCommentIdAndOwner(newLike) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [newLike.commentId, newLike.owner],
    };
    await this._pool.query(query);
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) AS likes FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].likes, 10);
  }
}

module.exports = LikeRepositoryPostgres;
