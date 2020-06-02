import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { User } from '../model/user';
import {Password } from '../services/password';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@kslntickets/common';
import { validateRequest } from '@kslntickets/common';

const router = express.Router();

router.post('/api/users/signin', 
  [
    body('email').isEmail().withMessage('Invalid Email format'),
    body('password').trim().notEmpty().withMessage('Password Shouldnot be empty')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({email});

    if (!existingUser) {
      throw new BadRequestError('Invalid Creds');
    }

    const isCorrectPassword = await Password.compare(existingUser.password, password);

    if (!isCorrectPassword) {
      throw new BadRequestError('Invalid Creds');
    }

    // creating jwt
    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!);

    // creating session using jwt
    req.session = {
      jwt: userJwt
    };

    res.status(200).send(existingUser);

  }
);

export { router as signinRouter };