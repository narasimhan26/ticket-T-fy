import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404 when page not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it('returns ticket page when ticket id is sent', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'new Ticket',
      price: 50
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({})
    .expect(200);
  
  expect(ticketResponse.body.title).toEqual('new Ticket');
  expect(ticketResponse.body.price).toEqual(50);
});