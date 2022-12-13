import { Observable } from 'rxjs';

export type OutputUser = {
  id: string;
};

export interface IUserAdapter {
  send<T>(data: T, pattern: string): Observable<OutputUser | never>;
}
