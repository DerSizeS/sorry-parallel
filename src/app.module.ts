import { Module } from '@nestjs/common';
import { DirectorModule } from 'sp/director';

@Module({
  imports: [DirectorModule],
})
export class AppModule {}
