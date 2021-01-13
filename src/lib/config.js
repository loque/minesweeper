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

const difficultyScore = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

function useProviderConfig() {
  const [config, setConfig] = useState({
    difficulty: "EASY",
    name: "",
    results: [],
  });

  function setDifficulty(difficulty) {
    setConfig((state) => ({ ...state, difficulty }));
  }

  function setName(name) {
    setConfig((state) => ({ ...state, name }));
  }

  // result: startTime, endTime, difficulty, gameTime, status,
  function addResult(newResult) {
    setConfig((state) => {
      const { results } = state;
      results.push(newResult);
      results.sort((a, b) => {
        const diffA = difficultyScore[a.difficulty];
        const diffB = difficultyScore[b.difficulty];
        if (diffA < diffB) return -1;
        if (diffA > diffB) return 1;
        if (a.gameTime < b.gameTime) return -1;
        if (a.gameTime > b.gameTime) return 1;
        return 0;
      });
      return { ...state, results };
    });
  }

  return { ...config, setDifficulty, setName, addResult };
}
