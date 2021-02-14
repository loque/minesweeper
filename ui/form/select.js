import styled, { keyframes } from "styled-components";
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption,
} from "@reach/listbox";
import "@reach/listbox/styles.css";
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

    &[data-reach-listbox-arrow] {
      font-size: 1em;
    }
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
  background-color: ${(p) => p.theme.color.bgLight};
  border-radius: 5px;
  border: 1px solid ${(p) => p.theme.color.accentAlpha};
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

export function Select({ value, onChange, children, label, large }) {
  return (
    <StyledInput value={value} onChange={onChange}>
      <StyledButton arrow={<ArrowDownIcon />} large={large}>
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
  background-color: ${(p) => p.theme.color.bgLight};
  &[data-current] {
    color: rgba(255, 255, 255, 0.4);
    background-color: ${(p) => p.theme.color.bgDark};
  }
  &[aria-selected="true"],
  &:hover {
    background-color: ${(p) => p.theme.color.bgLighter};
  }
`;

const positionDefault = (targetRect, popoverRect) => {
  if (!targetRect || !popoverRect) {
    return {};
  }

  const { directionRight } = getCollisions(targetRect, popoverRect);
  const { left: targetLeft, right: targetRight } = targetRect;
  const { width: popoverWidth } = popoverRect;
  const { pageXOffset } = window;
  return {
    left: directionRight
      ? `${targetRight - popoverWidth + pageXOffset}px`
      : `${targetLeft + pageXOffset}px`,
    ...getTopPosition(targetRect, popoverRect),
    width: targetRect.width,
  };
};

// TODO: if there is a workaround suggested in
// https://github.com/reach/reach-ui/issues/735 **then** we could design a popover
// that overlaps the button.
function getTopPosition(targetRect, popoverRect) {
  const { directionUp } = getCollisions(targetRect, popoverRect);
  const { top: targetTop, height: targetHeight } = targetRect;
  const { height: popoverHeight } = popoverRect;
  const { pageYOffset } = window;
  return {
    top: directionUp
      ? `${targetTop - popoverHeight + pageYOffset}px`
      : `${targetTop + targetHeight + pageYOffset}px`,
  };
}
