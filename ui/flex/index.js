import styled, { css } from "styled-components";

const flexBaseStyle = css`
  display: flex;
  justify-content: ${(props) => {
    switch (props.justify) {
      case "start":
        return "flex-start";
      case "end":
        return "flex-end";
      case "between":
        return "space-between";
      case "around":
        return "space-around";
      case "evenly":
        return "space-evenly";
      default:
        return "center";
    }
  }};
  align-items: ${(props) => {
    switch (props.align) {
      case "start":
        return "flex-start";
      case "end":
        return "flex-end";
      case "stretch":
        return "stretch";
      case "baseline":
        return "baseline";
      default:
        return "center";
    }
  }};
  gap: ${(props) => (props.gap ? props.gap : "none")};
`;

export const Center = styled.div`
  ${flexBaseStyle}
`;

export const Row = styled.div`
  flex-direction: row;
  ${flexBaseStyle}
`;

export const Col = styled.div`
  flex-direction: column;
  ${flexBaseStyle}
`;
