import type { ResolvedServerContext } from "@/types";

type IssueLocation = Partial<Pick<Location, "href" | "host" | "pathname">>;
type IssueEnv = Record<string, string | boolean | undefined>;

export interface BuildGithubIssueUrlOptions {
  repo: string;
  context?: ResolvedServerContext;
  location?: IssueLocation;
  env?: IssueEnv;
}

const defaultIssueHost = "https://github.com";

function browserLocation(): IssueLocation | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location;
}

function appEnv(): IssueEnv {
  return import.meta.env;
}

function addContextLine(lines: string[], label: string, value: string | undefined) {
  if (!value) return;
  lines.push(`- ${label}: ${value}`);
}

function stringEnv(env: IssueEnv, key: string) {
  const value = env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function appFlavor(env: IssueEnv) {
  return stringEnv(env, "VITE_APP_FLAVOR") ?? stringEnv(env, "VITE_WIKI_FLAVOR") ?? stringEnv(env, "VITE_FLAVOR");
}

function appEnvironment(env: IssueEnv) {
  return stringEnv(env, "VITE_APP_ENVIRONMENT") ?? stringEnv(env, "VITE_ENVIRONMENT");
}

export function buildGithubIssueUrl(options: BuildGithubIssueUrlOptions) {
  const env = options.env ?? appEnv();
  const location = options.location ?? browserLocation();
  const repoPath = options.repo.replace(/^\/+|\/+$/g, "");
  const issueUrl = new URL(`/${repoPath}/issues/new`, defaultIssueHost);
  const titleContext = options.context?.server.name;
  const contextLines: string[] = [];

  addContextLine(contextLines, "Repository", options.repo);
  addContextLine(contextLines, "Page URL", location?.href);
  addContextLine(contextLines, "Host", location?.host);
  addContextLine(contextLines, "Path", location?.pathname);

  if (options.context) {
    const { server, flavor } = options.context;
    addContextLine(contextLines, "Server", `${server.name} (${server.slug})`);
    addContextLine(contextLines, "Chronicle API", options.context.chronicle.baseUrl);
    addContextLine(contextLines, "Flavor", `${flavor.name} (${flavor.slug})`);
  }

  addContextLine(contextLines, "Mode", stringEnv(env, "MODE"));
  addContextLine(contextLines, "Base URL", stringEnv(env, "BASE_URL"));
  addContextLine(contextLines, "App flavor", appFlavor(env));
  addContextLine(contextLines, "App environment", appEnvironment(env));

  issueUrl.search = new URLSearchParams({
    title: titleContext ? `Wiki error report: ${titleContext}` : "Wiki error report",
    body: `Please describe the error:\n\n\nContext:\n${contextLines.join("\n")}`,
  }).toString();

  return issueUrl.toString();
}
