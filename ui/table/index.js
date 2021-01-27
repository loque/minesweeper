import styled, { css } from "styled-components";

export const Table = styled.table`
  width: 100%;
`;

export const THead = styled.thead``;
export const TBody = styled.tbody`
  font-size: 0.9rem;
`;

export const Tr = styled.tr``;
export const Td = styled.td`
  padding: 1em 0;
  text-align: center;
  min-width: 3em;
  span {
    display: flex;
    justify-content: center;
    align-items: center;
    svg:not(:last-child) {
      margin-right: 0.4em;
    }
    span {
      font-size: 0.9rem;
    }
  }
  ${(props) => props.center && centerTd}
`;
const centerTd = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;
