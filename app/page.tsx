"use client";

import CodeEditorView, {
  CodeEditorViewRef,
} from "@/components/views/code-editor-view";
import useEditorStatesContext from "@/lib/hooks/use-editor-states-context";
import { useMicVAD, utils } from "@/lib/hooks/use-mic-vad";
import { BaseLLM, getModelLLM } from "@/lib/llm/llm";
import { BaseSTT, getModelSTT } from "@/lib/stt/stt";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CodeEditorAgent } from "@/lib/agent/code-editor-agent";
import { BaseTTS, getModelTTS } from "@/lib/tts/tts";
import AgentChatTerminalView from "@/components/views/agent-chat-terminal-view";
import { AnimatePresence, motion } from "framer-motion";
import { ViewRef } from "@/lib/types";
import EditorToolbar from "@/components/editor-toolbar";
import { getPlatform } from "@/lib/platforms/platform-checker";

export default function Home() {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const viewMap = useRef<Map<string, ViewRef | null>>(new Map());
  const { editorStates, updateEditorStates } = useEditorStatesContext();

  const sttModelRef = useRef<BaseSTT | undefined>(undefined);
  const llmModelRef = useRef<BaseLLM | undefined>(undefined);
  const ttsModelRef = useRef<BaseTTS | undefined>(undefined);

  // TODO: Use a timer to stop recorder if no speech is detected for more than 30 seconds

  const [isProcessing, setIsProcessing] = useState(false);
  const vad = useMicVAD({
    startOnLoad: false,
    ortConfig(ort) {
      ort.env.wasm.wasmPaths = "/vad/";
    },
    workletURL: "/vad/vad.worklet.bundle.min.js",
    modelURL: "/vad/silero_vad.onnx",
    onSpeechStart: () => {
      if (!isProcessing) {
        updateEditorStates({ isListening: true });
      }
    },
    onSpeechEnd: (audio) => {
      if (!isProcessing) {
        setIsProcessing(true);
        const wavBuffer = utils.encodeWAV(audio);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });
        console.log("Speech end\n", blob);

        if (!llmModelRef.current) {
          toast.error("LLM model not loaded");
          return;
        }
        const agent = new CodeEditorAgent(
          sttModelRef.current,
          llmModelRef.current,
          ttsModelRef.current,
        );
        const codeEditor = viewMap.current.get("1") as CodeEditorViewRef;
        const viewDocument = codeEditor?.getViewDocument();
        updateEditorStates({ isListening: false, isThinking: true });
        agent
          .generateAgentCompletion(
            viewDocument?.fileContent || "",
            viewDocument?.selections || [],
            {
              audio: blob,
            },
          )
          .then((result) => {
            const changes = agent.getLineChanges(result.text.codeCompletion);
            updateEditorStates({ isThinking: false });

            // Apply changes
            const codeEditor = viewMap.current.get("1") as CodeEditorViewRef;
            codeEditor?.applyChanges(changes);

            // Play the audio in the blob
            if (result.audio) {
              const audio = new Audio(URL.createObjectURL(result.audio));
              audio.onended = () => {
                console.log("Audio ended");
                updateEditorStates({ isSpeaking: false });
                setIsProcessing(false);
              };
              updateEditorStates({ isSpeaking: true });
              audio.play();
              return;
            }
            setIsProcessing(false);
          });
      }
    },
  });

  // Check platform
  useEffect(() => {
    const platform = getPlatform();
    console.log("Platform:", platform);
  }, []);

  // Load models
  useEffect(() => {
    if (editorStates?.settings) {
      // Load STT
      if (
        editorStates.settings.sttAPIKey &&
        editorStates.settings.sttProvider &&
        editorStates.settings.sttModel
      ) {
        const model = getModelSTT(
          editorStates.settings.sttAPIKey,
          editorStates.settings.sttProvider,
          editorStates.settings.sttModel,
        );
        sttModelRef.current = model;
      } else {
        toast.error("Please set STT Provider, Model and API key in settings");
      }

      // Load LLM
      if (
        editorStates.settings.llmAPIKey &&
        editorStates.settings.llmProvider &&
        editorStates.settings.llmModel
      ) {
        const model = getModelLLM(
          editorStates.settings.llmAPIKey,
          editorStates.settings.llmProvider,
          editorStates.settings.llmModel,
          0.85,
        );
        llmModelRef.current = model;
      } else {
        toast.error("Please set LLM Provider, Model and API key in settings");
      }

      // Load TTS
      if (
        editorStates.settings.ttsAPIKey &&
        editorStates.settings.ttsProvider &&
        editorStates.settings.ttsModel &&
        editorStates.settings.ttsVoice
      ) {
        const model = getModelTTS(
          editorStates.settings.ttsAPIKey,
          editorStates.settings.ttsProvider,
          editorStates.settings.ttsModel,
          editorStates.settings.ttsVoice,
        );
        ttsModelRef.current = model;
      } else {
        toast.error("Please set TTS Provider, Model and API key in settings");
      }
    }
  }, [editorStates]);

  // Toggle recording
  useEffect(() => {
    if (editorStates?.isRecording) {
      vad.start();
    } else {
      vad.stop();
    }
  }, [editorStates, vad]);

  return (
    <div className="flex h-full w-full flex-col">
      <EditorToolbar />

      <div className="flex h-full w-full flex-col p-1">
        <div className="flex h-full w-full flex-col items-start justify-between space-y-1.5 overflow-hidden rounded-xl bg-default p-2">
          <div
            className={`min-h-0 w-full flex-grow`}
            style={{
              cursor:
                editorStates?.isDrawing && !isCanvasReady ? "wait" : "auto",
            }}
          >
            <CodeEditorView
              ref={(ref) => {
                viewMap.current.set("1", ref);
              }}
              width="100%"
              height="100%"
              url="/test.tsx"
              isDrawingMode={editorStates?.isDrawing}
              isDownloadClip={editorStates?.isDownloadClip}
              isDrawHulls={editorStates?.isDrawHulls}
              setIsCanvasReady={setIsCanvasReady}
            />
          </div>
          <AnimatePresence>
            {editorStates?.isOpenChatView && (
              <motion.div
                className="h-full min-h-[60%] w-full pb-14"
                // Enter from bottom and exit to bottom
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
              >
                <AgentChatTerminalView
                  ref={(ref) => {
                    viewMap.current.set("2", ref);
                  }}
                  viewMap={viewMap}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
