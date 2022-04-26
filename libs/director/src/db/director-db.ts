import { Observable } from 'rxjs';

export const DIRECTOR_DB = Symbol();

export interface DirectorDB {
  getRunner(jobId: JobId, nodeId: NodeId, job: Job): Observable<Runner>;

  getUnclaimedRunnerTask(
    jobId: JobId,
    nodeId: NodeId,
    runnerId: RunnerId,
  ): Observable<Task | null>;

  getNextRunnerTask(
    jobId: JobId,
    nodeId: NodeId,
    runnerId: RunnerId,
    previousTaskId?: TaskId,
  ): Observable<Task | null>;
}

export interface Task {
  id: string;
}

export interface Job {
  tasks: Task[];
}

export interface Runner {
  id: string;
}

export type JobId = string;
export type NodeId = string;
export type RunnerId = Runner['id'];
export type TaskId = Task['id'];
