import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(): string[];
    }
  }
}

jest.mock('../nats-wrapper.ts');


let mongo : any;
beforeAll( async () => {
  jest.clearAllMocks();
  process.env.JWT_KEY = 'asdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach( async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll( async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getCookie = () => {
 // hard code to get base64 cookie only inside tickets service

 // cretae a payload
 const payload = {
   id: new mongoose.Types.ObjectId().toHexString(),
   email: 'test@test.com'
 }
 // get jwt key
 const token = jwt.sign(payload, process.env.JWT_KEY!);
 
 // set session 
 const session = {jwt: token};

 //build session json
 const sessionJSON = JSON.stringify(session);

 //encode to base64
 const base64 = Buffer.from(sessionJSON).toString('base64');

 return [`express:sess=${base64}`];
};