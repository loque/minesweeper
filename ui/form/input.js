import styled, { css } from "styled-components";
import common from "./common";

const baseFormElementStyle = css`
  background-color: #342f30b8;
  margin-bottom: 0.5em;
`;

export const Input = styled.input`
  ${common}
  ${baseFormElementStyle}
`;
