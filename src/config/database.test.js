const database = require('./database');

describe('database config should be read from environment', () => {

  test('hostname should has type of string', () => {
    expect(typeof database.hostname).toBe('string');
  })

  test('db name should has type of string', () => {
    expect(typeof database.name).toBe('string');
  })

  test('user should has type of string', () => {
    expect(typeof database.user).toBe('string');
  })

  test('password should has type of string', () => {
    expect(typeof database.password).toBe('string');
  })

});
