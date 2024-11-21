"use client";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { MenuStates, Settings } from "@/lib/interface";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

interface MenuStatesContextType {
  menuStates: MenuStates;
  setMenuStates: Dispatch<SetStateAction<MenuStates>>;
}

export const MenuStatesContext = createContext<
  MenuStatesContextType | undefined
>(undefined);

export default function MenuStatesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuStates, setMenuStates] = useState<MenuStates>({
    isDrawingMode: false,
    isDrawHulls: true,
    isDownloadClip: false,
    isRecording: false,
  });

  const { getValue } = useLocalStorage();

  useEffect(() => {
    // Load settings from local storage
    const loadedSettings: Settings = {};

    const sttProvider = getValue<string>("sttProvider");
    const llmProvider = getValue<string>("llmProvider");
    const ttsProvider = getValue<string>("ttsProvider");
    const sttModel = getValue<string>("sttModel");
    const llmModel = getValue<string>("llmModel");
    const ttsModel = getValue<string>("ttsModel");
    const isUsePassword = getValue<boolean>("isUsePassword");
    const isPasswordSet = getValue<boolean>("isPasswordSet");

    loadedSettings.sttProvider = sttProvider ?? undefined;
    loadedSettings.llmProvider = llmProvider ?? undefined;
    loadedSettings.ttsProvider = ttsProvider ?? undefined;
    loadedSettings.sttModel = sttModel ?? undefined;
    loadedSettings.llmModel = llmModel ?? undefined;
    loadedSettings.ttsModel = ttsModel ?? undefined;
    loadedSettings.isUsePassword = isUsePassword ?? undefined;
    loadedSettings.isPasswordSet = isPasswordSet ?? undefined;

    // Only load API keys here if password is not set.
    // If password is set, API keys will be loaded after password is entered.
    if (!isPasswordSet) {
      const sttAPIKey = getValue<string>("sttAPIKey");
      const llmAPIKey = getValue<string>("llmAPIKey");
      const ttsAPIKey = getValue<string>("ttsAPIKey");
      loadedSettings.sttAPIKey = sttAPIKey ?? undefined;
      loadedSettings.llmAPIKey = llmAPIKey ?? undefined;
      loadedSettings.ttsAPIKey = ttsAPIKey ?? undefined;
    }


    setMenuStates((prev) => ({
      ...prev,
      settings: loadedSettings,
    }));
  }, []);

  return (
    <MenuStatesContext.Provider value={{ menuStates, setMenuStates }}>
      {children}
    </MenuStatesContext.Provider>
  );
}
function getValue<T>(arg0: string) {
  throw new Error("Function not implemented.");
}
