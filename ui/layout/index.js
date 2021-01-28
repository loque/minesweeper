import styled from "styled-components";
import { Col } from "../flex";

export const View = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Container = styled(Col)`
  margin: 2rem 0 4rem;
  min-width: 400px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 2rem; */
  h1 {
    margin: 0;
  }
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 1em;
  svg {
    margin-right: 0.5em;
  }
`;
