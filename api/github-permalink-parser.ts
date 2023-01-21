import { createGithubTokenOctokit, WillTheRealOctokitPleaseStandup } from "./deps.ts";

export interface FileContentApiResponse {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string;
  _links: {
    git: string;
    self: string;
    html: string;
  };
}

export const GithubHashRe = /#L([0-9]+)-?L?([0-9]+)?/g;

export interface GithubPermalinkParserOptions {
  /**
   * @default Deno.env.get("CR_PAT") ?? Deno.env.get("GITHUB_TOKEN");
   */
  readonly githubToken?: string;
}

export class GithubPermalinkParser {
  static async init(options: GithubPermalinkParserOptions = {}) {
    const token = options.githubToken ?? Deno.env.get("CR_PAT") ?? Deno.env.get("GITHUB_TOKEN");
    if (token == null) {
      console.warn("No Github Token found, you will not be able to parse permalinks from private repos!");
      throw new Error("");
    }
    return new GithubPermalinkParser(await createGithubTokenOctokit({ githubToken: token }));
  }

  constructor(readonly octokit: WillTheRealOctokitPleaseStandup) {}

  async processUrl(url: URL) {
    const content = await this.#fetchContent(url);
    const hash = this.parseLineNumbersHash(url);
    if (hash == null) {
      return {
        content,
      };
    } else {
      return {
        // Line numbers are 1 based in github vs 0 based in array api
        content: content.split("\n").slice(hash.start - 1, hash.end).join("\n"),
        fullContent: content,
      };
    }
  }

  parseLineNumbersHash(url: URL) {
    const stringUrl = url.href;
    const matches = Array.from(stringUrl.matchAll(GithubHashRe)).at(0);

    console.log("Found line number hash matches", matches);

    if (matches != null) {
      const startIndex = matches.at(1)!;
      const endIndex = matches.at(2);
      return {
        start: Number(startIndex),
        end: endIndex != null ? Number(endIndex) : undefined,
      };
    }
    return null;
  }

  /**
   * TODO: This isn't really correct, since there are permalinks with branch names instead of refs.
   * TODO: Ideally we should check with the GitHub API to see if the `ref` we parse is either a ref or a branch
   */
  #extractPermalinkData(url: URL) {
    // Remove host since we don't care
    const { pathname } = url;
    // Extract key components from url
    const [, owner, repo, ...restData] = pathname.split("/");
    // If we encounter `blob` just chop it off, the next path part is either a branch name or sha
    if (restData[0] === "blob") {
      restData.splice(0, 1);
    }
    const [ref, ...restPath] = restData;
    const path = restPath.join("/");
    return {
      owner,
      repo,
      path,
      ref,
    } as const;
  }

  async #fetchContent(url: URL) {
    const { owner, repo, ref, path } = this.#extractPermalinkData(url);
    const { data } = await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      ref,
      path,
      mediaType: { "format": "raw" },
    });
    return data as unknown as string;
  }
}
