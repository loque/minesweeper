import { css } from "styled-components";

export default css`
  font-size: 0.9rem;
  padding: 0 1.4em;
  height: 3.6em;
  border-radius: 5px;
  border: 1px solid #8e8e8e1c;
  color: rgba(255, 255, 255, 0.5);
  &:focus:not(:disabled),
  &:active:not(:disabled) {
    outline: none;
    border-color: #d68c024a;
    box-shadow: 0 0 6px #d68c024a;
  }

  ${(props) => !props.disabled && nonDisabledStyle}
  ${(props) => props.disabled && disabledStyle}
  ${(props) => props.large && largeStyle}
`;

const largeStyle = css`
  font-size: 1.2rem;
  height: 3.2em;
`;

const nonDisabledStyle = css`
  box-shadow: 0 3px 6px #0000002b;
  &:hover {
    filter: brightness(1.1);
  }
`;

const disabledStyle = css`
  cursor: not-allowed;
  filter: opacity(60%);
`;
