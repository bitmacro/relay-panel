import packageJson from "../../package.json";

/** relay-panel version from package.json (build-time), same source as AuthenticatedAppShell footer. */
export const PANEL_PACKAGE_VERSION: string = packageJson.version;
