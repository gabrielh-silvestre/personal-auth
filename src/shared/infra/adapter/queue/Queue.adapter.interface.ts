import { Observable } from 'rxjs';

export interface IQueueAdapter {
  send<T>(event: string, data: any): Observable<T>;
  emit(event: string, data: any): void;
}
