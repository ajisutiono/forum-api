const createServer = require('../createServer');

describe('Hello World endpoint', () => {
  it('should return Hello World successfully', async () => {
    const server = await createServer({});
    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.message).toEqual('Hello World!');
  });
});
