import { Injectable } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import {
  DirectorDB,
  Job,
  JobId,
  NodeId,
  Runner,
  RunnerId,
  Task,
  TaskId,
} from 'sp/director/db';
import { randomBytes } from 'crypto';

@Injectable()
export class DirectorDBInMemoryService implements DirectorDB {
  private readonly id = randomBytes(20).toString('hex');
  private readonly tasks = new Map<JobId, Set<TaskId>>();
  private readonly claimedTasks = new Map<JobId, Set<TaskId>>();
  private readonly runnerTasks = new Map<RunnerId, TaskId[]>();

  getRunner(jobId: JobId, nodeId: NodeId, job: Job): Observable<Runner> {
    this.tasks.set(
      jobId,
      new Set([
        ...(this.tasks.get(jobId) || []),
        ...job.tasks.map(({ id }) => id),
      ]),
    );

    return of({ id: this.getRunnerId(jobId, nodeId) });
  }

  getUnclaimedRunnerTask(
    jobId: JobId,
    nodeId: NodeId,
    runnerId: RunnerId,
  ): Observable<Task | null> {
    if (runnerId !== this.getRunnerId(jobId, nodeId)) {
      return throwError(() => new Error(`Malformed runner id: ${runnerId}`));
    }

    const tasksIds = this.tasks.get(jobId);

    if (!tasksIds || !tasksIds.size) {
      return throwError(
        () => new Error(`No tasks founds for job with id: ${jobId}`),
      );
    }

    const [nextTaskId] = Array.from(tasksIds).filter(
      (taskId) => !this.claimedTasks.has(taskId),
    );

    if (!nextTaskId) {
      return of(null);
    }

    this.claimedTasks.set(
      jobId,
      new Set([...(this.claimedTasks.get(jobId) || []), nextTaskId]),
    );

    this.runnerTasks.set(jobId, [
      ...(this.runnerTasks.get(jobId) || []),
      nextTaskId,
    ]);

    return of({ id: nextTaskId });
  }

  getNextRunnerTask(
    jobId: JobId,
    nodeId: NodeId,
    runnerId: RunnerId,
    previousTaskId?: TaskId,
  ): Observable<Task | null> {
    if (runnerId !== this.getRunnerId(jobId, nodeId)) {
      return throwError(() => new Error(`Malformed runner id: ${runnerId}`));
    }

    const tasksIds = this.runnerTasks.get(runnerId);

    if (!tasksIds || !tasksIds.length) {
      return throwError(
        () => new Error(`No tasks founds for runner with id: ${jobId}`),
      );
    }

    if (!previousTaskId) {
      const [firstTaskId] = tasksIds;

      return of({ id: firstTaskId });
    }

    const previousTaskIdIndex = tasksIds.findIndex(
      (taskId) => taskId === previousTaskId,
    );

    if (previousTaskIdIndex === -1) {
      return throwError(() => new Error(`No task with id: ${previousTaskId}`));
    }

    const nextTaskId = tasksIds[previousTaskIdIndex + 1];

    if (!nextTaskId) {
      return of(null);
    }

    return of({ id: nextTaskId });
  }

  private getRunnerId(jobId: JobId, nodeId: NodeId): RunnerId {
    return `${this.id}-${jobId}-${nodeId}`;
  }
}
