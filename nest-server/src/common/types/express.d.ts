import { UserAfterAuth } from 'src/decorators/user.decorators';

declare global {
  namespace Express {
    interface Request {
      user?: UserAfterAuth;
    }
  }
}
