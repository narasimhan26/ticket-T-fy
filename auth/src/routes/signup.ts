import express, { Request, Response} from 'express';
import { body } from 'express-validator';
import { User } from '../model/user';
import { validateRequest } from '@kslntickets/common';
import { BadRequestError } from '@kslntickets/common';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signup', 
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({min: 4, max: 20}).withMessage('Password should be between 4 and 20 Characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({email});

    if (existingUser) {
      throw new BadRequestError('Email Already exists');
    }

    const user = User.build({email, password});
    await user.save();

    // creating jwt
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_KEY!);

    // creating session using jwt
    req.session = {
      jwt: userJwt
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter};