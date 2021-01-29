import { createGlobalStyle } from "styled-components";
import normalize from "./normalize";

export const GlobalStyle = createGlobalStyle`
${normalize}

* {
  box-sizing: border-box;
}

html,
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  background-color: ${(p) => p.theme.color.bg};
  color: rgba(255, 255, 255, 0.699);
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}


h1 {
  margin: 0;
}
`;
