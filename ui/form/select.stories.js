import React, { useState } from "react";
import { Select, Option } from "./select";

export default {
  title: "Forms/Select",
  component: Select,
  argTypes: {
    children: { control: { disable: true } },
  },
};

const Template = (args) => {
  const [value, setValue] = useState(1);
  return (
    <Select
      {...args}
      value={value}
      onChange={setValue}
      label={(val) => `Level ${val}`}
    >
      <Option value={1}>Level 1</Option>
      <Option value={2}>Level 2</Option>
      <Option value={3}>Level 3</Option>
    </Select>
  );
};

const defaultPropValues = {
  disabled: false,
};

export const Default = Template.bind({});
Default.args = {
  ...defaultPropValues,
};
