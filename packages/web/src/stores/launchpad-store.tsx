import { Contract } from "near-api-js";
import create from "zustand/react";

interface LaunchpadContract extends Contract {}

export const useLaunchpadStore = create((get, set) => ({}));
