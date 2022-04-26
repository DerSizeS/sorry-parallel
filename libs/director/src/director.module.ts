import { Module } from '@nestjs/common';
import { DirectorController } from './director.controller';
import { DirectorDBInMemoryService } from 'sp/director-db-in-memory';
import { DIRECTOR_DB } from 'sp/director/db';

@Module({
  providers: [
    DirectorDBInMemoryService,
    { provide: DIRECTOR_DB, useExisting: DirectorDBInMemoryService },
  ],
  controllers: [DirectorController],
})
export class DirectorModule {}
