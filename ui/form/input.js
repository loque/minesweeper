import styled, { css } from "styled-components";
import common from "./common";

const baseFormElementStyle = css`
  background-color: ${(p) => p.theme.color.formBg};
  margin-bottom: 0.5em;
`;

export const Input = styled.input`
  ${common}
  ${baseFormElementStyle}
`;
