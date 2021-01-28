import React from "react";
import { Input } from "./input";

export default {
  title: "Forms/Input",
  component: Input,
  argTypes: {
    children: { control: { disable: true } },
  },
};

const Template = (args) => <Input {...args} />;

const defaultPropValues = {
  type: "text",
  placeholder: "Write your string...",
  large: false,
  disabled: false,
};

export const Text = Template.bind({});
Text.args = {
  ...defaultPropValues,
  type: "text",
};
