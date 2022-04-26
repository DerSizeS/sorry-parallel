import axios from 'axios';
import {
  from,
  map,
  Observable,
  switchMap,
  of,
  subscribeOn,
  asyncScheduler,
} from 'rxjs';
import { JobId, NodeId, Runner, RunnerId, Task, TaskId } from 'sp/director';
import { Executor } from 'sp/executor';

export class ClientNx {
  private readonly axios = axios.create({
    baseURL: this.url,
  });

  constructor(
    private readonly url: string,
    private readonly executor: Executor,
    private readonly jobId: JobId,
    private readonly nodeId: NodeId,
    private readonly target: string,
    private readonly tasks: TaskId[],
  ) {}

  private getRunner(): Observable<Runner> {
    return from(
      this.axios.post<Runner>(`/director/runner/${this.jobId}/${this.nodeId}`, {
        tasks: this.tasks,
      }),
    ).pipe(map(({ data }) => data));
  }

  private getTask(
    runnerId: RunnerId,
    previousTaskId?: TaskId,
  ): Observable<Task | null> {
    return from(
      this.axios.get<Task | null>(
        `/director/runner/${this.jobId}/${this.nodeId}/${runnerId}/task`,
        {
          params: { previousTaskId },
        },
      ),
    ).pipe(map(({ data }) => data));
  }

  private drainTasks(
    runnerId: RunnerId,
    previousTaskId?: TaskId,
  ): Observable<Task | null> {
    return this.getTask(runnerId, previousTaskId).pipe(
      switchMap((task) => {
        if (!task) {
          return of(null);
        }

        return this.executor
          .execute(this.target, task.id)
          .pipe(switchMap(() => this.drainTasks(runnerId, task.id)));
      }),
      subscribeOn(asyncScheduler),
    );
  }

  asObservable(): Observable<unknown> {
    return this.getRunner().pipe(
      switchMap((runner) => this.drainTasks(runner.id)),
    );
  }
}
