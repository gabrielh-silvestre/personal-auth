import { Observable } from 'rxjs';

export type AuthResponse = {
  userId: string;
};

export interface IAuthAdapter {
  verify(token: string): Observable<AuthResponse | null>;
}
