import React from "react";
import { Button } from "./button";
import {
  RiPlayFill as PlayIcon,
  RiEmotionFill as HappyIcon,
} from "react-icons/ri";

export default {
  title: "Forms/Button",
  component: Button,
  argTypes: {
    children: { control: { disable: true } },
  },
};

const Template = (args) => <Button {...args} />;

const defaultPropValues = { cta: false, large: false, disabled: false };

export const Text = Template.bind({});
Text.args = {
  ...defaultPropValues,
  children: "Text",
};

export const TextIcon = Template.bind({});
TextIcon.args = {
  ...defaultPropValues,
  children: (
    <>
      Text with icon
      <PlayIcon />
    </>
  ),
};

export const IconText = Template.bind({});
IconText.args = {
  ...defaultPropValues,
  children: (
    <>
      <HappyIcon />
      You won!
    </>
  ),
};

export const CTA = Template.bind({});
CTA.args = {
  ...defaultPropValues,
  children: "Call to action",
  cta: true,
};
