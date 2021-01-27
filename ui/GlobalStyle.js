import { createGlobalStyle } from "styled-components";
import normalize from "./normalize";

export const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}

html,
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  background-color: #292425;
  color: rgba(255, 255, 255, 0.699);
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.red {
  color: #a40000;
}
.blue {
  color: blue;
}
.dark-blue {
  color: rgb(2, 2, 119);
}
.green {
  color: green;
}
.yellow {
  color: #d68c02;
}

${normalize}
`;
