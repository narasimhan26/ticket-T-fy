import request from 'supertest';
import { app } from '../../app';
import { response } from 'express';

it('returns 201 on successfull signup', async () => {
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);
});

it('retuns 400 on invalid email', async () => {
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'testom',
    password: 'password'
  })
  .expect(400);
});

it('retuns 400 on invalid pass', async () => {
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'p'
  })
  .expect(400);
});

it('retuns 400 on invalid pass', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
  })
  .expect(400);

  await request(app)
  .post('/api/users/signup')
  .send({
    password: 't',
  })
  .expect(400);
});

it('disallow duplicates', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);

  await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(400);
});

it('sets cookie after sucessfull signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  
  expect(response.get('Set-Cookie')).toBeDefined();
});