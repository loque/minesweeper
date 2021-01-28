import styled, { keyframes } from "styled-components";
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from "@reach/listbox";
import { getCollisions } from "@reach/popover";
import { RiArrowDownSLine as ArrowDownIcon } from "react-icons/ri";
import common from "./common";
import { baseStyle } from "./button";

const StyledInput = styled(ListboxInput)`
  display: inline-block;
`;

const StyledButton = styled(ListboxButton)`
  ${common}
  ${baseStyle}
  justify-content: space-between;

  & > span {
    margin-left: 0.4em;
    display: flex;
    justify-content: center;
  }
`;

const slide = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const StyledPopover = styled(ListboxPopover)`
  background-color: #322d2e;
  border-radius: 5px;
  border: 1px solid #d68c024a;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.29);
  animation: ${slide} 200ms ease-in-out;
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

export const Option = styled(ListboxOption)`
  padding: 0.8em 1.2em;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  background-color: #322d2e;
  &[data-current] {
    color: rgba(255, 255, 255, 0.4);
    background-color: #282425;
  }
  &[aria-selected="true"],
  &:hover {
    background-color: #3c3637;
  }
`;

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
