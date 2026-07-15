import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared/common/exceptions/unauthorized.exception';
import { IGoogleLoginInput } from '../dto/google-login.input';

@Injectable()
export class GoogleLoginUseCase {
  async execute(input: IGoogleLoginInput) {
    // TODO: Implement Google Login Flow when frontend is ready
    // 
    // Step 1: Verify the Google ID Token
    // - Use `google-auth-library` to verify the `input.token`
    // - Extract `email`, `name`, `sub` (Google ID), and `picture` from the payload
    //
    // Step 2: Check for existing User by Email
    // - Find user by email in the `UsersModule`
    // - If user exists but doesn't have a `googleId` in `AuthAccount`:
    //     - Link the account: Update `AuthAccount` to save `googleId`
    // - If user doesn't exist:
    //     - Create new User in `UsersModule` (mark `isEmailVerified: true` since it's from Google)
    //     - Create new `AuthAccount` with `googleId` (no password needed)
    //
    // Step 3: Generate JWT Tokens
    // - Generate Access Token via `TokenService`
    // - Generate Refresh Token (userId:randomString)
    // - Hash Refresh Token and save to database
    //
    // Step 4: Return tokens and user info
    //
    throw new UnauthorizedException('Google Login is not implemented yet', 'NOT_IMPLEMENTED');
  }
}
