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

export const baseStyles = css`
  background-color: ${(props) =>
    props.transparent ? "transparent" : "#342f30"};
  color: rgba(255, 255, 255, 0.4);
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
  /* ${(props) => props.selected && "color: #d68c02 !important;"} */
`;

const baseNonDisabledStyle = css`
  background-image: linear-gradient(#a8a6a60a 30%, transparent);
  &:active {
    transform: translateY(1px);
    background-image: linear-gradient(#00000012, transparent);
  }
`;

const ctaStyle = css`
  background-color: #d68c02;
  color: #342f30;
  font-weight: 600;
  text-transform: uppercase;
  svg {
    color: #342f30;
  }
  &:focus {
    box-shadow: 0 1px 20px 0px #d68c02a6 !important;
  }
  ${(props) => !props.disabled && ctaNonDisabledStyle}
`;

const ctaNonDisabledStyle = css`
  background-image: linear-gradient(#d5d5d54a 30%, transparent);
  box-shadow: 0 3px 6px #000000b0, 0 -2px 10px #d68c0233;
`;

const StyledButton = styled.button`
  ${common}
  ${baseStyles}
  ${(props) => props.cta && ctaStyle}
`;

const StyledAnchor = styled.a`
  ${common}
  ${baseStyles}
  ${(props) => props.cta && ctaStyle}
`;
