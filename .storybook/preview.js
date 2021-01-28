import React from "react";
import { GlobalStyle } from "../ui/GlobalStyle";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  darkMode: {
    current: "dark",
  },
};

export const decorators = [
  (Story) => (
    <>
      <Story />
      <GlobalStyle />
    </>
  ),
];
