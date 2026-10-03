import { createQueryApi } from "@perceptual/agent";
import { observe } from "@perceptual/browser";
import { diagnose } from "@perceptual/diagnostics";

const observer = observe();
export const interfaceView = createQueryApi(observer, { diagnose });
