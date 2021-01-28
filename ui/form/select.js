import { forwardRef } from "react";
import styled, { css } from "styled-components";
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
  useListboxContext,
} from "@reach/listbox";
import { getCollisions } from "@reach/popover";
// import "@reach/listbox/styles.css";
import { RiArrowDownSLine as ArrowDownIcon } from "react-icons/ri";
import common from "./common";
import { baseStyles } from "./button";

const StyledInput = styled(ListboxInput)`
  display: inline-block;
`;

const StyledButton = styled(ListboxButton)`
  ${common}
  ${baseStyles}
  justify-content: space-between;

  & > span {
    margin-left: 0.4em;
    display: flex;
    justify-content: center;
  }
`;

const StyledPopover = styled(ListboxPopover)`
  background-color: #322d2e;
  border-radius: 5px;
  border: 1px solid #d68c024a;
`;

const StyledList = styled(ListboxList)`
  list-style: none;
  margin: 0;
  padding: 0.5em 0;
  &:focus:not(:disabled),
  &:active:not(:disabled) {
    outline: none;
  }
`;

export function Select({ value, onChange, children, label }) {
  return (
    <StyledInput value={value} onChange={onChange}>
      <StyledButton arrow={ArrowDownIcon}>
        {typeof label === "function" ? label(value) : value}
      </StyledButton>
      <StyledPopover position={positionDefault}>
        <StyledList>{children}</StyledList>
      </StyledPopover>
    </StyledInput>
  );
}

const StyledOption = styled(ListboxOption)`
  padding: 0.8em 1.2em;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  background-color: #322d2e;
  ${(props) => props.selected && selectedStyle}
  ${(props) => !props.selected && unselectedStyle}
`;

const unselectedStyle = css`
  &:hover {
    background-color: #3c3637;
  }
`;
const selectedStyle = css`
  filter: brightness(0.9);
`;

export const Option = forwardRef(function Option(props, ref) {
  const { value } = useListboxContext();
  return <StyledOption ref={ref} {...props} selected={props.value === value} />;
});

const positionDefault = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  const { directionRight } = getCollisions(targetRect, popoverRect);
  return {
    left: directionRight
      ? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
      : `${targetRect.left + window.pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect),
    width: targetRect.width,
  };
};

function getTopPosition(targetRect, popoverRect) {
  const { directionUp } = getCollisions(targetRect, popoverRect);
  return {
    top: directionUp
      ? `calc(${
          targetRect.top -
          popoverRect.height +
          window.pageYOffset +
          targetRect.height
        }px + 0.5em)`
      : `calc(${
          targetRect.top +
          targetRect.height +
          window.pageYOffset -
          targetRect.height
        }px - 0.5em)`,
  };
}