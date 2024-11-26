export interface MenuStates {
  isDrawingMode: boolean;
  isDrawHulls: boolean;
  isDownloadClip: boolean;

  // Voice agent
  isRecording: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;

  // Settings
  settings?: Settings;
}

export interface Settings {
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
  selections: SelectionInformation[];
  suggestedLines?: LineChange[];
}

export interface LineChange {
  // Index starts from 1
  index: number;
  content: string;
  status: "added" | "deleted" | "modified";
}
