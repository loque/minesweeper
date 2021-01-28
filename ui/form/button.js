import NextLink from "next/link";
import styled, { css } from "styled-components";
import common from "./common";
import { forwardRef, Children, Fragment } from "react";

export const Button = forwardRef(function Button(
  { children, href, ...props },
  ref
) {
  const safeChildren = wrapTextChildInSpan(children);

  if (typeof href === "string") {
    return (
      <NextLink href={href} {...props}>
        <StyledAnchor {...props} tabIndex="0">
          {safeChildren}
        </StyledAnchor>
      </NextLink>
    );
  }

  return (
    <StyledButton ref={ref} {...props}>
      {safeChildren}
    </StyledButton>
  );
});

function wrapTextChildInSpan(children) {
  let safeChildren = Children.toArray(children);
  if (safeChildren[0].type === Fragment) {
    safeChildren = Children.toArray(safeChildren[0].props.children);
  }
  safeChildren = safeChildren.map((child) => {
    if (typeof child === "string") {
      child = <span key={"strkey" + child}>{child}</span>;
    }
    return child;
  });
  return safeChildren;
}

export const baseStyle = css`
  background-color: ${(props) =>
    props.transparent ? "transparent" : "rgb(52,47,48)"};
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  & > svg {
    &:first-child {
      margin-right: 0.4em;
    }
    &:last-child {
      margin-left: 0.4em;
    }
  }
  ${(props) => !props.disabled && baseNonDisabledStyle}
`;

const b = 1.5;
const baseNonDisabledStyle = css`
  background-image: linear-gradient(
    rgba(${52 * b}, ${47 * b}, ${48 * b}, 0.1) 10%,
    transparent 50%
  );
  &:active {
    transform: translateY(1px);
    filter: brightness(0.9);
  }
`;

const ctaStyle = css`
  background-color: #d68c02;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 600;
  text-transform: uppercase;
  svg {
    color: rgba(0, 0, 0, 0.75);
  }
  &:focus {
    box-shadow: 0 1px 20px 0px rgba(214, 140, 2, 0.65) !important;
  }
  ${(props) => !props.disabled && ctaNonDisabledStyle}
`;

const ctaNonDisabledStyle = css`
  background-image: linear-gradient(rgba(213, 213, 213, 0.28) 30%, transparent);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.69), 0 -2px 10px rgba(214, 140, 2, 0.2);
`;

const StyledButton = styled.button`
  ${common}
  ${baseStyle}
  ${(props) => props.cta && ctaStyle}
`;

const StyledAnchor = styled.a`
  ${common}
  ${baseStyle}
  ${(props) => props.cta && ctaStyle}
`;
