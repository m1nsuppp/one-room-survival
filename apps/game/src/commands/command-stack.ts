import type { Command } from './command';

export class CommandStack {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private readonly onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;
  }

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.onChange?.();
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (command !== undefined) {
      command.undo();
      this.redoStack.push(command);
      this.onChange?.();
    }
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (command !== undefined) {
      command.execute();
      this.undoStack.push(command);
      this.onChange?.();
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getUndoDescription(): string | undefined {
    const command = this.undoStack[this.undoStack.length - 1];

    return command?.getDescription();
  }

  getRedoDescription(): string | undefined {
    const command = this.redoStack[this.redoStack.length - 1];

    return command?.getDescription();
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.onChange?.();
  }
}
