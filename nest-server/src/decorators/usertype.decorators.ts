import { SetMetadata } from '@nestjs/common';
import { UserType } from 'src/enums/enums';

export const USER_TYPE_KEY = 'user_type';
export const Usertype = (...user_type: UserType[]) =>
  SetMetadata(USER_TYPE_KEY, user_type);
