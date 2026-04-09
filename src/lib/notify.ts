import { sileo } from "@sileo/react";

export const notify = {
  success: (m: string) => sileo.success(m),
  error: (m: string) => sileo.error(m),
  info: (m: string) => sileo.info(m),
  warning: (m: string) => sileo.warning(m),
};

