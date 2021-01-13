import { createContext, useContext, useState } from "react";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const config = useProviderConfig();

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export const useConfig = () => {
  return useContext(ConfigContext);
};

function useProviderConfig() {
  const [config, setConfig] = useState({ difficultyLevel: "EASY" });

  function setDifficultyLevel(difficultyLevel) {
    setConfig((state) => ({ ...state, difficultyLevel }));
  }

  return { ...config, setDifficultyLevel };
}
