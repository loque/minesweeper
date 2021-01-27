import { css } from "styled-components";

const textIcon = css`
  display: flex;
  align-items: center;
  svg {
    padding-left: 0.5em;
  }
`;

const iconText = css`
  display: flex;
  align-items: center;
  svg {
    padding-right: 0.5rem;
    font-size: 1.5em;
  }
  /* &.p-right {
    padding-right: 3rem;
  } */
`;

export const common = css`
  background-color: ${(props) =>
    props.transparent ? "transparent" : "#342f30"};
  color: rgba(255, 255, 255, 0.4);
  padding: 0.6rem 1rem;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  svg {
    font-size: 1.2em;
  }
  &:focus {
    outline: none;
    color: #d68c02;
  }
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 -1px #00000059, 0 1px #7a571b47;
    background-image: linear-gradient(#00000012, transparent);
  }
  &:hover {
    filter: brightness(1.24) opacity(70%);
  }
  ${(props) => props.textIcon && textIcon}
  ${(props) => props.iconText && iconText}
`;
