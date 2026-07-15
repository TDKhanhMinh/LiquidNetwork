import { IBaseRepository } from '../../../../shared/database/repositories/base.repository.interface';
import { IAuthAccount } from '../entities/auth-account.entity';

export interface IAuthAccountRepository extends IBaseRepository<IAuthAccount> {
  findByUserId(userId: string): Promise<IAuthAccount | null>;
}
