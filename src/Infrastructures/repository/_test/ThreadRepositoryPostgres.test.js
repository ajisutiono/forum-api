const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  it('should be an instance of ThreadRepository domain', () => {
    // Arrange
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {}, {});

    // Action & Assert
    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should create new thread and return added thread correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        });

        const fakeThreadIdGenerator = (x = 10) => '123';
        class fakeDateGenerator {
          constructor() {
            this.toISOString = () => '2025-12-12T12:12:12.123Z';
          }
        }

        const newThread = new NewThread({
          title: 'A thread title',
          body: 'A thread body',
          owner: 'user-123',
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(
          pool, fakeThreadIdGenerator, fakeDateGenerator,
        );

        // ACtion
        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        // Assert
        const threads = await ThreadsTableTestHelper.findThreadById(addedThread.id);
        expect(addedThread).toStrictEqual(new AddedThread({
          id: `thread-${fakeThreadIdGenerator()}`,
          title: 'A thread title',
          owner: 'user-123',
        }));
        expect(threads).toBeDefined();
        expect(threads).toHaveLength(1);
      });
    });

    describe('getThreadById function', () => {
      it('should return NotFoundError when thread is not found', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

        // Action & Assert
        await expect(threadRepositoryPostgres.getThreadById('thread-x'))
          .rejects
          .toThrowError(NotFoundError);
      });

      it('should return thread when thread is found', async () => {
        // Arrange
        const newThread = {
          id: 'thread-123', title: 'A thread title', body: 'A thread body', owner: 'user-123', date: '2025-12-12T12:12:12.123Z',
        };
        const expectedThread = {
          id: 'thread-123',
          title: 'A thread title',
          date: '2025-12-12T12:12:12.123Z',
          username: 'dicoding',
          body: 'A thread body',
        };
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123', username: expectedThread.username });
        await ThreadsTableTestHelper.addThread(newThread);

        // Action
        const acquiredThread = await threadRepositoryPostgres.getThreadById('thread-123');

        // Assert
        expect(acquiredThread).toStrictEqual(expectedThread);
      });
    });

    // Menambahkan test untuk verifyThreadAvailability sesuai saran dari tim reviewer
    describe('verifyThreadAvailability', () => {
      it('should not throw error if thread is available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          owner: 'user-123',
        });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
          .resolves.not.toThrow();
      });

      it('should throw NotFoundError if thread does not exist', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-x'))
          .rejects.toThrowError(NotFoundError);
      });
    });
  });
});
