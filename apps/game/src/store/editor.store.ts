import { createStore, type StoreApi } from 'zustand';
import type { Room } from '@/models/room.model';
import type { Rotation } from '@/models/furniture.model';
import type { Command } from '@/commands/command';
import type { ValidationFeedback } from '@/policies/validation-feedback';
import { CommandStack } from '@/commands/command-stack';

export interface EditorActions {
  selectFurniture: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  updateFurniturePosition: (id: string, x: number, z: number) => void;
  updateFurnitureRotation: (id: string, rotation: Rotation) => void;
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  setValidationFeedback: (feedback: ValidationFeedback | null) => void;
  clearValidationFeedback: () => void;
}

export interface EditorState {
  room: Room;
  selectedFurnitureId: string | null;
  isDragging: boolean;
  canUndo: boolean;
  canRedo: boolean;
  validationFeedback: ValidationFeedback | null;
  actions: EditorActions;
}

export function createEditorStore(initialRoom: Room): StoreApi<EditorState> {
  const commandStack = new CommandStack();

  return createStore<EditorState>((set) => {
    const actions: EditorActions = {
      selectFurniture: (id) => set({ selectedFurnitureId: id }),

      setDragging: (isDragging) => set({ isDragging }),

      updateFurniturePosition: (id, x, z) =>
        set((state) => ({
          room: {
            ...state.room,
            furnitures: state.room.furnitures.map((f) =>
              f.id === id ? { ...f, x, z } : f
            ),
          },
        })),

      updateFurnitureRotation: (id, rotation) =>
        set((state) => ({
          room: {
            ...state.room,
            furnitures: state.room.furnitures.map((f) =>
              f.id === id ? { ...f, rotation } : f
            ),
          },
        })),

      executeCommand: (command) => {
        commandStack.execute(command);
        set({
          canUndo: commandStack.canUndo(),
          canRedo: commandStack.canRedo(),
        });
      },

      undo: () => {
        commandStack.undo();
        set({
          canUndo: commandStack.canUndo(),
          canRedo: commandStack.canRedo(),
        });
      },

      redo: () => {
        commandStack.redo();
        set({
          canUndo: commandStack.canUndo(),
          canRedo: commandStack.canRedo(),
        });
      },

      setValidationFeedback: (feedback) => set({ validationFeedback: feedback }),

      clearValidationFeedback: () => set({ validationFeedback: null }),
    };

    return {
      room: initialRoom,
      selectedFurnitureId: null,
      isDragging: false,
      canUndo: false,
      canRedo: false,
      validationFeedback: null,
      actions,
    };
  });
}
