import { Executor } from 'sp/executor';
import { Observable, bindNodeCallback } from 'rxjs';
import { spawn } from 'child_process';
import readline from 'readline';

export abstract class ExecutorSpawn implements Executor {
  protected constructor(private readonly console?: ExecutorConsole) {}

  execute(target: string, task: string): Observable<unknown> {
    const { command, args } = this.createCommand(target, task);

    return new SpawnObservable(command, args, this.console);
  }

  abstract createCommand(target: string, task: string): ExecutorSpawnCommand;
}

export interface ExecutorSpawnCommand {
  command: string;
  args?: string[];
}

export interface ExecutorConsole {
  log(message: string): void;
  error(message: string): void;
}

class SpawnObservable extends Observable<unknown> {
  constructor(command: string, args?: string[], console?: ExecutorConsole) {
    super((observer) => {
      const child = spawn(command, args || []);

      if (console) {
        readline
          .createInterface({ input: child.stdout, terminal: false })
          .on('line', (line) => console.log(line));

        readline
          .createInterface({ input: child.stderr, terminal: false })
          .on('line', (line) => console.error(line));
      }

      child.on('close', (code) => {
        if (code === 0) {
          observer.complete();
        } else {
          observer.error(new Error(`Child process exited with code ${code}`));
        }
      });

      return () => child.kill();
    });
  }
}
