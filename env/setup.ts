#!/usr/bin/env -S npx --yes tsx
import { execSync } from "child_process";

execSync("npm install", { stdio: "inherit" });
