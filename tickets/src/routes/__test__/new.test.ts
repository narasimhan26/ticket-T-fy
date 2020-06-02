import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to post request /api/tickets', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('has to be access only when user signedin', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('return status other that 401 when signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('return error when invalid title is provides', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      price: 10
    })
    .expect(400);
});

it('return error when invalid prices is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      price: -10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'jshdb'
    })
    .expect(400);
});

it('create a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'akdhkjb',
      price: 20
    })
    .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('Checks for proper publishes', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'akdhkjb',
      price: 20
    })
    .expect(201);
  
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});