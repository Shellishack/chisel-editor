import { Dispatch, SetStateAction } from "react";

export interface EditorStates {
  // Selection by drawing
  isDrawing: boolean;
  isDrawHulls: boolean;
  isDownloadClip: boolean;

  // Inline/popover chat
  isInlineChat: boolean;

  // Open chat view
  isOpenChatView: boolean;

  // Voice agent
  isRecording: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
}

export interface PersistSettings {
  sttProvider?: string;
  llmProvider?: string;
  ttsProvider?: string;

  sttModel?: string;
  llmModel?: string;
  ttsModel?: string;

  sttAPIKey?: string;
  llmAPIKey?: string;
  ttsAPIKey?: string;

  isUsePassword?: boolean;
  isPasswordSet?: boolean;
  password?: string;
  ttl?: number;

  ttsVoice?: string;
}

export interface DrawnLine {
  points: {
    x: number;
    y: number;
  }[];
}

export interface SelectionInformation {
  lineStart: number;
  lineEnd: number;
  text: string;
}

export interface CodeCompletionInstruction {
  text?: string;
  audio?: Blob;
}

export interface CodeCompletionResult {
  text: {
    codeCompletion: string;
    explanation: string;
  };
  audio?: Blob;
}

export interface InlineSuggestionResult {
  snippets: string[];
}

export interface ViewDocument {
  fileContent: string;
  filePath: string;
  selections?: SelectionInformation[];
  suggestedLines?: LineChange[];
}

export interface LineChange {
  // Index starts from 1
  index: number;
  content: string;
  status: "added" | "deleted" | "modified";
}

export interface ChatMessage {
  from: string;
  content: string;
  datetime: string;
}

export interface AgentConfig {
  name: string;
  icon?: string;
  description?: string;
  prompt: string;
}

export type ViewRef = {
  getType: () => string;
};

export type Folder = {
  file: File;
  uri: string;
}[];

export interface EditorContextType {
  editorStates: EditorStates;
  setEditorStates: Dispatch<SetStateAction<EditorStates>>;
  persistSettings: PersistSettings | undefined;
  setPersistSettings: Dispatch<SetStateAction<PersistSettings | undefined>>;
  addView: (viewId: string, view: ViewRef) => void;
  getViewById: (viewId: string) => ViewRef | undefined;
  getViewByType: (viewType: string) => ViewRef[];
  deleteView: (viewId: string) => void;
}
