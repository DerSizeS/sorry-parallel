import {
  ExecutorConsole,
  ExecutorSpawn,
  ExecutorSpawnCommand,
} from 'sp/executor-spawn';

export class ExecutorNxSpawn extends ExecutorSpawn {
  constructor(private readonly args?: string[], console?: ExecutorConsole) {
    super(console);
  }

  createCommand(target: string, task: string): ExecutorSpawnCommand {
    return {
      command: `npm run nx ${task}:${target}`,
      args: this.args.length ? ['--', ...this.args] : [],
    };
  }
}
