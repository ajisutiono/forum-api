const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    // Register User
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
    // Registered User
    expect(DomainErrorTranslator.translate(new Error('REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat registered user karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat registered user karena tipe data tidak sesuai'));
    // User Login
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('username dan password harus string'));
    // Authentication Token
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
    // Thread
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan thread karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan thread karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail thread karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail thread karena tipe data tidak sesuai'));
    // Comment
    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat comment baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan comment karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan comment karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail comment karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail comment karena tipe data tidak sesuai'));
    // Reply
    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat reply baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan reply karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan reply karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail reply karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('DETAILED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat mendapatkan detail reply karena tipe data tidak sesuai'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
