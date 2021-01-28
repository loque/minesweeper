import Head from "next/head";
import { useEffect, useRef } from "react";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as LevelIcon,
  RiPlayFill as PlayIcon,
} from "react-icons/ri";
import { levels } from "../lib/useGame";
import { View, Container, SectionTitle } from "../ui/layout";
import { Input, Button, Small, Select, Option } from "../ui/form";
import { Center, Col } from "../ui/flex";

export default function Home() {
  const config = useConfig();
  const autofocus = useRef();

  useEffect(() => {
    if (autofocus.current) autofocus.current.focus();
  }, [autofocus]);

  function changeUsername(e) {
    let username = e.target.value.toUpperCase();
    const re = /[A-Z0-9]+/g;
    username = (username.match(re) || []).join("");
    username = username.slice(0, 3);
    config.setUsername(username);
  }

  return (
    <View>
      <Container gap="4em" align="stretch">
        <Header setupBtn={false} />
        <div>
          <SectionTitle>
            <UserIcon />
            Set your username
          </SectionTitle>
          <Col align="stretch">
            <Input
              type="text"
              ref={autofocus}
              value={config.username}
              onChange={changeUsername}
            />
            <Small hide={config.username.length === 3}>
              (*) username must be alphanumeric and 3 characters long.
            </Small>
          </Col>
        </div>
        <Col align="stretch" style={{ marginBottom: "calc(0.5em + 0.76rem)" }}>
          <SectionTitle>
            <LevelIcon /> Select level
          </SectionTitle>
          <Select
            value={config.level}
            onChange={config.setLevel}
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
            disabled={config.username.length !== 3}
            onClick={(ev) => {
              if (config.username.length < 3) {
                ev.preventDefault();
              }
            }}
          >
            Play
            <PlayIcon />
          </Button>
        </Center>
      </Container>
    </View>
  );
}
