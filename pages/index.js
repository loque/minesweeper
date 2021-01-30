import Head from "next/head";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { usernameSelector, levelSelector, levels } from "../game/states";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as LevelIcon,
  RiPlayFill as PlayIcon,
} from "react-icons/ri";
import { View, Container, SectionTitle } from "../ui/layout";
import { Input, Button, Small, Select, Option } from "../ui/form";
import { Center, Col } from "../ui/flex";

export default function Home() {
  const [username, setUsername] = useRecoilState(usernameSelector);
  const [level, setLevel] = useRecoilState(levelSelector);
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  function changeUsername(e) {
    let nextUsername = e.target.value.toUpperCase();
    const re = /[A-Z0-9]+/g;
    nextUsername = (nextUsername.match(re) || []).join("");
    nextUsername = nextUsername.slice(0, 3);
    setUsername(nextUsername);
  }

  function playHandler(ev) {
    return username.length < 3 && ev.preventDefault();
  }

  return (
    <View>
      <Container>
        <Header />
        <div>
          <SectionTitle>
            <UserIcon />
            Set your username
          </SectionTitle>
          <Col align="stretch">
            <Input
              type="text"
              ref={autofocus}
              value={username}
              onChange={changeUsername}
            />
            <Small hide={username.length === 3}>
              (*) username must be alphanumeric and 3 characters long.
            </Small>
          </Col>
        </div>
        <Col align="stretch" style={{ marginBottom: "calc(0.5em + 0.76rem)" }}>
          <SectionTitle>
            <LevelIcon /> Select level
          </SectionTitle>
          <Select
            value={level}
            onChange={setLevel}
            label={(val) => `Level ${val}`}
          >
            {levels.map((_, levelIdx) => {
              const level = levelIdx + 1;
              return (
                <Option key={levelIdx} value={level}>
                  Level {level}
                </Option>
              );
            })}
          </Select>
        </Col>
        <Center>
          <Button
            cta
            large
            href={"/game"}
            disabled={username.length !== 3}
            onClick={playHandler}
          >
            Play
            <PlayIcon />
          </Button>
        </Center>
      </Container>
    </View>
  );
}
