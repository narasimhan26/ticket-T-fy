import request from 'supertest';
import { app } from '../../app';
import mongoose, { mongo } from 'mongoose';
import { cookie } from 'express-validator';
import {Ticket} from '../../model/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 when ticket not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getCookie())
    .send({
      title: 'asdf',
      price: 20
    })
    .expect(404);
});

it('returns 401 when not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'asdf',
      price: 20
    })
    .expect(401);
});

it('returns 401 when ticket not owned by user', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.getCookie())
    .send({
      title: 'asdf',
      price: 20
    });
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.getCookie())
      .send({
        title: 'sjhdb',
        price: 35
      })
      .expect(401);
});

it('returns 400 if invalid titile and price is given', async () => {
  const cookie = global.getCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdf',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 30
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'sfjb',
      price: -30
    })
    .expect(400);
});

it('check for updating the ticket', async () => {
  const cookie = global.getCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdf',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new Title',
      price: 30
    })
    .expect(200);
  
  const updatedTicket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(updatedTicket.body.title).toEqual('new Title');
  expect(updatedTicket.body.price).toEqual(30);
});

it('publishes the event when updated', async () => {
  const cookie = global.getCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdf',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new Title',
      price: 30
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects to update the reserved ticket', async () => {
  const cookie = global.getCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdf',
      price: 20
    });
  
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new Title',
      price: 30
    })
    .expect(400);
});