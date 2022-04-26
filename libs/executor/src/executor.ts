import { Observable } from 'rxjs';

export interface Executor {
  execute(target: string, task: string): Observable<unknown>;
}
