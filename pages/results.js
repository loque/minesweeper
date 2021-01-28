import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiRefreshLine as ReloadIcon,
  RiUser3Fill as UserIcon,
  RiMedalFill as MedalIcon,
  RiFlashlightFill as LevelIcon,
  RiEmotionFill as HappyIcon,
  RiEmotionUnhappyFill as SadIcon,
  RiTimerFill as TimeIcon,
  RiCalendarEventFill as CalendarIcon,
  RiCloseLine as ClearIcon,
} from "react-icons/ri";
import { msToMS } from "../lib/utils";
import { View, Container } from "../ui/layout";
import { Button } from "../ui/form";
import { Table, THead, TBody, Tr, Td } from "../ui/table";
import styled from "styled-components";

export default function Results() {
  const config = useConfig();
  return (
    <View>
      <Container>
        <Header
          title={
            <ResultsTitle>
              <MedalIcon />
              Top 10
            </ResultsTitle>
          }
          setupBtn={true}
          playAgainBtn={false}
        />

        <div className="play-again-wrapper">
          <Button className="icon-text" href="/game">
            <ReloadIcon />
            Play again
          </Button>
        </div>

        {!!config.results.length && (
          <Table>
            <THead>
              <Tr>
                <Td title="Date">
                  <span>
                    <CalendarIcon />
                  </span>
                </Td>
                <Td title="Game time">
                  <span>
                    <TimeIcon />
                  </span>
                </Td>
                <Td title="Level">
                  <LevelIcon />
                </Td>
                <Td title="Result">
                  <MedalIcon />
                </Td>
                <Td title="Username">
                  <UserIcon />
                </Td>
              </Tr>
            </THead>
            <TBody>
              {config.results
                .sort(sortResults)
                .slice(0, 10)
                .map((res, resIdx) => {
                  return (
                    <Tr key={resIdx}>
                      <Td>{new Date(res.endDateTime).toLocaleDateString()}</Td>
                      <Td>
                        <div>{msToMS(res.gameTime)}</div>
                      </Td>
                      <Td>
                        <div>{res.level}</div>
                      </Td>
                      <Td center style={{ fontSize: "1.1rem" }}>
                        {res.result === "WON" && (
                          <HappyIcon className="yellow" />
                        )}
                        {res.result === "LOST" && <SadIcon className="red" />}
                      </Td>
                      <Td>
                        <div>{res.username}</div>
                      </Td>
                    </Tr>
                  );
                })}
            </TBody>
          </Table>
        )}
      </Container>
    </View>
  );
}

const resultValue = {
  WON: 1,
  LOST: -1,
};

function sortResults(a, b) {
  if (resultValue[a.result] > resultValue[b.result]) return -1;
  if (resultValue[a.result] < resultValue[b.result]) return 1;

  if (a.level > b.level) return -1;
  if (a.level < b.level) return 1;

  if (a.gameTime < b.gameTime) return -1;
  if (a.gameTime > b.gameTime) return 1;

  return 0;
}

const ResultsTitle = styled.h1`
  display: flex;
  align-items: center;
  svg {
    margin-right: 0.5em;
  }
`;
