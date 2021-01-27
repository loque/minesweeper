import Head from "next/head";
// import "../styles/Setup.module.scss";
import { useEffect, useRef } from "react";
import useConfig from "../lib/useConfig";
import Header from "../components/Header";
import {
  RiUser3Fill as UserIcon,
  RiFlashlightFill as LevelIcon,
  RiPlayFill as PlayIcon,
} from "react-icons/ri";
import { levels } from "../lib/useGame";
import {
  View,
  Container,
  Section,
  SectionTitle,
  SectionBody,
} from "../ui/layout";
import { Button, Link } from "../ui/button";
import { Input } from "../ui/form";

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

  function selectLevel(level) {
    return () => config.setLevel(level);
  }

  return (
    <View>
      <Container>
        <Header setupBtn={false} />
        <Section>
          <SectionTitle>
            <UserIcon />
            Set your username
          </SectionTitle>
          <SectionBody username>
            <Input
              type="text"
              ref={autofocus}
              value={config.username}
              onChange={changeUsername}
            />
            <small
              className={config.username.length !== 3 ? "shown" : "hidden"}
            >
              (*) username must be alphanumeric and 3 characters long.
            </small>
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>
            <LevelIcon /> Select level
          </SectionTitle>
          <SectionBody level>
            {levels.map((_, levelIdx) => {
              const level = levelIdx + 1;
              return (
                <Button
                  key={levelIdx}
                  selected={String(config.level) === String(level)}
                  onClick={selectLevel(level)}
                >
                  {level}
                </Button>
              );
            })}
          </SectionBody>
        </Section>
        <Link
          textIcon
          cta
          // className="playBtn"
          href={"/game"}
          onClick={(ev) => {
            if (config.username.length < 3) {
              ev.preventDefault();
            }
          }}
        >
          Play
          <PlayIcon className="yellow" />
        </Link>
      </Container>
    </View>
  );
}
