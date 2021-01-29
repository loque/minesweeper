import { css } from "styled-components";

export default css`
  font-size: 0.9rem;
  padding: 0 1.4em;
  height: 3.6em;
  border-radius: 5px;
  border: 1px solid ${(p) => p.theme.color.formBorder};
  color: rgba(255, 255, 255, 0.5);
  &:focus:not(:disabled),
  &:active:not(:disabled) {
    outline: none;
    border-color: ${(p) => p.theme.accentAlpha};
    box-shadow: 0 0 6px ${(p) => p.theme.accentAlpha};
  }

  ${(props) => !props.disabled && nonDisabledStyle}
  ${(props) => props.disabled && disabledStyle}
  ${(props) => props.large && largeStyle}
  ${(props) => props.edgeLeft && edgeLeftStyle}
  ${(props) => props.edgeRight && edgeRightStyle}
`;

const largeStyle = css`
  font-size: 1.2rem;
  height: 3.2em;
`;

const nonDisabledStyle = css`
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.168);
  &:hover {
    filter: brightness(1.1);
  }
`;

const disabledStyle = css`
  cursor: not-allowed;
  filter: opacity(60%);
`;

const edgeLeftStyle = css`
  margin-left: -1.4em;
`;

const edgeRightStyle = css`
  margin-right: -1.4em;
`;
