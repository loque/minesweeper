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

const initialState = {
  level: localStorage.getItem("level") || 0,
  name: localStorage.getItem("name") || "",
  results: JSON.parse(localStorage.getItem("results")) || [],
};

function useProviderConfig() {
  const [config, setConfig] = useState(initialState);

  function setLevel(level) {
    localStorage.setItem("level", level);
    setConfig((state) => ({ ...state, level }));
  }

  function setName(name) {
    localStorage.setItem("name", name);
    setConfig((state) => ({ ...state, name }));
  }

  // result: startTime, endTime, level, gameTime, status,
  function addResult(newResult) {
    setConfig((state) => {
      const { results } = state;
      results.push(newResult);
      results.sort((a, b) => {
        if (a.level < b.level) return -1;
        if (a.level > b.level) return 1;
        if (a.gameTime < b.gameTime) return -1;
        if (a.gameTime > b.gameTime) return 1;
        return 0;
      });
      localStorage.setItem("results", JSON.stringify(results));
      return { ...state, results };
    });
  }

  function clearResults() {
    setConfig((state) => {
      let { results } = state;
      results = [];
      localStorage.setItem("results", JSON.stringify(results));
      return { ...state, results };
    });
  }

  return { ...config, setLevel, setName, addResult, clearResults };
}
