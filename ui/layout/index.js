import styled, { css } from "styled-components";

export const View = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  h1 {
    margin: 0;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 3em;
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  svg {
    margin-right: 0.5em;
  }
`;

export const SectionBody = styled.div`
  display: flex;
  justify-content: center;
  ${(props) => props.username && sectionBodyUsername}
  ${(props) => props.level && sectionBodyLevel}
`;

const sectionBodyUsername = css`
  display: flex;
  flex-direction: column;
  input {
    flex: 1;
    font-size: 1rem;
  }
  small {
    color: #d68c02;
    font-size: 0.76em;
    text-align: right;
    padding: 0.5rem 0;
    opacity: 0.8;
    cursor: default;
    &.hidden {
      opacity: 0;
      visibility: none;
    }
  }
`;
const sectionBodyLevel = css`
  gap: 1.5em;
  button {
    flex: 1;
    display: flex;
    justify-content: center;
    &.selected {
      box-shadow: 0 0 0 1px #d68c02;
    }
  }
`;
