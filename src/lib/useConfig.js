import { createContext, useContext, useState } from "react";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const config = useProviderConfig();

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export default function useConfig() {
  return useContext(ConfigContext);
}

const initialState = {
  level: localStorage.getItem("level") || 1,
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

  function addResult(newResult) {
    setConfig((state) => {
      const { results } = state;
      results.push(newResult);
      localStorage.setItem("results", JSON.stringify(results));
      return { ...state, results };
    });
  }

  function clearResults() {
    setConfig((state) => {
      const results = [];
      localStorage.setItem("results", JSON.stringify(results));
      return { ...state, results };
    });
  }

  return { ...config, setLevel, setName, addResult, clearResults };
}
