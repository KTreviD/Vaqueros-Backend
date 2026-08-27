import { User } from "../../database/models/user";
import { Session } from "../../database/models/session";

export class UserResponseDto {
  id: number;
  name: string | null;
  surnames: string | null;
  email: string;
  userPreferences: {
    enable2FA: boolean;
    emailNotification: boolean;
  };

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.surnames = user.surnames;
    this.email = user.email;
    this.userPreferences = {
      enable2FA: user?.userPreferences?.enable2FA,
      emailNotification: user?.userPreferences?.emailNotification,
    };
  }
}

export class SessionResponseDto {
  id: number;

  constructor(session: Session) {
    this.id = session.id;
  }
}

export class AuthResponse {
  static success(params: {
    user: UserResponseDto;
    session: SessionResponseDto;
    accessToken: string;
    refreshToken: string;
  }): AuthSuccessResponse {
    return {
      mfaRequired: false,
      user: params.user,
      session: params.session,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    };
  }

  static mfaRequired(): AuthMfaResponse {
    return {
      mfaRequired: true,
      user: null,
      session: null,
      accessToken: null,
      refreshToken: null,
    };
  }
}

type AuthSuccessResponse = {
  mfaRequired: false;
  user: UserResponseDto;
  session: SessionResponseDto;
  accessToken: string;
  refreshToken: string;
};

type AuthMfaResponse = {
  mfaRequired: true;
  user: null;
  session: null;
  accessToken: null;
  refreshToken: null;
};

export type AuthResult = AuthSuccessResponse | AuthMfaResponse;
