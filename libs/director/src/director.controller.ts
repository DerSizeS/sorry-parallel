import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  DIRECTOR_DB,
  DirectorDB,
  Job,
  JobId,
  NodeId,
  Runner,
  RunnerId,
  Task,
  TaskId,
} from 'sp/director/db';
import { Observable, of, switchMap } from 'rxjs';

@Controller('director')
export class DirectorController {
  constructor(@Inject(DIRECTOR_DB) private readonly directorDB: DirectorDB) {}

  @Post('runner/:jobId/:nodeId')
  getRunner(
    @Param('jobId') jobId: JobId,
    @Param('nodeId') nodeId: NodeId,
    @Body() job: Job,
  ): Observable<Runner> {
    return this.directorDB.getRunner(jobId, nodeId, job);
  }

  @Get('runner/:jobId/:nodeId/:runnerId/task')
  getRunnerTask(
    @Param('jobId') jobId: JobId,
    @Param('nodeId') nodeId: NodeId,
    @Param('runnerId') runnerId: RunnerId,
    @Query('previousTaskId') previousTaskId?: TaskId,
  ): Observable<Task | null> {
    return this.directorDB.getUnclaimedRunnerTask(jobId, nodeId, runnerId).pipe(
      switchMap((task) => {
        if (task) {
          return of(task);
        }

        return this.directorDB.getNextRunnerTask(
          jobId,
          nodeId,
          runnerId,
          previousTaskId,
        );
      }),
    );
  }
}
