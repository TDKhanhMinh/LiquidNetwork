import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IUser } from '../interfaces/user.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  // Add specific methods for User if necessary in the future
}
