import styled, { css } from "styled-components";
import common from "./common";

const baseFormElementStyle = css`
  padding: 1.1em 1.4em;
  font-size: 0.9rem;
  background-color: #342f30b8;
  margin-bottom: 0.5em;
`;

export const Input = styled.input`
  ${common}
  ${baseFormElementStyle}
`;
