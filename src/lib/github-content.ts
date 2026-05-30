const REPO_OWNER = "DrianeDiojanPerez"
const REPO_NAME = "tech_monkey_v6"
const REPO_BRANCH = "master"

const API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`

type FileMeta = { sha: string; content: string }

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}

export async function getFile(
  token: string,
  path: string
): Promise<FileMeta | null> {
  const res = await fetch(`${API}/${path}?ref=${REPO_BRANCH}`, {
    headers: authHeaders(token),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  const data = await res.json()
  return { sha: data.sha, content: data.content }
}

export async function putFile(
  token: string,
  path: string,
  base64Content: string,
  message: string,
  sha?: string
): Promise<void> {
  const res = await fetch(`${API}/${path}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: REPO_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PUT ${path} failed: ${res.status} ${body}`)
  }
}

export function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/refs/heads/${REPO_BRANCH}/${path}`
}

export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ""
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunk) as unknown as Array<number>
    )
  }
  return btoa(bin)
}
