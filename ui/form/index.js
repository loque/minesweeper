import styled, { css } from "styled-components";

export * from "./input";
export * from "./button";
export * from "./select";

const hiddenStyle = css`
  opacity: 0;
  visibility: none;
`;

export const Small = styled.small`
  color: ${(p) => p.theme.color.accent};
  font-size: 0.76rem;
  text-align: right;
  opacity: 0.8;
  cursor: default;
  ${(props) => props.hide && hiddenStyle}
`;
