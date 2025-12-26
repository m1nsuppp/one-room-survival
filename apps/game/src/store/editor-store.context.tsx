import { createContext, useContext, useState, type ReactNode, type JSX } from 'react';
import { useStore, type StoreApi } from 'zustand';
import type { Room } from '@/models/room.model';
import { createEditorStore, type EditorState, type EditorActions } from './editor.store';

const EditorStoreContext = createContext<StoreApi<EditorState> | null>(null);

interface EditorStoreProviderProps {
  children: ReactNode;
  initialRoom: Room;
}

export function EditorStoreProvider({
  children,
  initialRoom,
}: EditorStoreProviderProps): JSX.Element {
  const [store] = useState(() => createEditorStore(initialRoom));

  return <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>;
}

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (store === null) {
    throw new Error('useEditorStore must be used within EditorStoreProvider');
  }

  return useStore(store, selector);
}

export function useEditorActions(): EditorActions {
  return useEditorStore((s) => s.actions);
}

export function useEditorStoreApi(): StoreApi<EditorState> {
  const store = useContext(EditorStoreContext);
  if (store === null) {
    throw new Error('useEditorStoreApi must be used within EditorStoreProvider');
  }

  return store;
}
