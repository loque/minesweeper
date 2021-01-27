import NextLink from "next/link";
import styled, { css } from "styled-components";
import { common } from "../formElements";

const cta = css`
  background-color: #d68c02 !important;
  color: #342f30;
  display: inline-flex;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.8rem 1.6rem;
  svg {
    font-size: 1.5em;
    color: #342f30;
  }
  &:focus {
    color: #342f30 !important;
    box-shadow: 0 1px 20px 0px #d68c02a6;
  }
  &:disabled {
    filter: opacity(70%);
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  ${common}
  ${(props) => props.cta && cta}
`;

export const Anchor = styled.a`
  ${common}
  ${(props) => props.cta && cta}
`;

export const Link = ({ children, href, ...props }) => {
  return (
    <NextLink href={href} {...props}>
      <Anchor>{children}</Anchor>
    </NextLink>
  );
};
