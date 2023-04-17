import * as React from "react";
import { Typography } from "@mui/material";
import { createComponent } from "@mui/toolpad/browser";

export interface TestProps {
  msg: string;
}

function Test({ msg }: TestProps) {
  return <Typography>{msg}</Typography>;
}

export default createComponent(Test, {
  argTypes: {
    msg: {
      typeDef: { type: "string", default: "Hello world!" },
    },
  },
});
