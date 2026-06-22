#!/usr/bin/env node
import { cp, mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const PLUGIN_NAME = "viewfoundry-swiftui";
const PLUGIN_ROOT = path.join("plugins", PLUGIN_NAME);
const MARKETPLACE_PATH = path.join(".agents", "plugins", "marketplace.json");
const REQUIRED_SKILL_FILES = [
  "references/architecture.md",
  "references/workflow.md",
  "references/review-learnings.md",
  "assets/swiftui-sandbox-template/ViewFoundrySandboxApp.swift",
];
const INSTALL_POLICIES = new Set([
  "NOT_AVAILABLE",
  "AVAILABLE",
  "INSTALLED_BY_DEFAULT",
]);
const AUTH_POLICIES = new Set(["ON_INSTALL", "ON_USE"]);
const SECRET_OR_METADATA_RE =
  /(^co-authored-by:|^generated-by:|api[_-]?key|secret[_-]?key|token\s*[:=]|-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----)/im;

const mode = process.argv[2] ?? "validate";
const repoRoot = process.cwd();

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  return JSON.parse(await readFile(filePath, "utf8"));
}

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveRelative(root, rawPath, label) {
  assert(typeof rawPath === "string" && rawPath.trim(), `${label} must be a non-empty string`);
  assert(rawPath.startsWith("./"), `${label} must start with ./`);
  const resolved = path.resolve(root, rawPath);
  assert(inside(root, resolved), `${label} must stay inside plugin root`);
  return resolved;
}

async function listFiles(root, current = "") {
  const dir = path.join(root, current);
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath.split(path.sep).join("/"));
    }
  }
  return files.sort();
}

async function assertPathExists(targetPath, label, kind = "any") {
  let targetStat;
  try {
    targetStat = await stat(targetPath);
  } catch {
    fail(`${label} points to missing path`);
  }
  if (kind === "file") assert(targetStat.isFile(), `${label} must point to a file`);
  if (kind === "dir") assert(targetStat.isDirectory(), `${label} must point to a directory`);
}

function assertNoBadText(relativePath, contents) {
  assert(!SECRET_OR_METADATA_RE.test(contents), `${relativePath} contains forbidden secret/generated metadata text`);
  assert(!contents.includes("nijanthanvijayakumar/viewfoundry-swiftui"), `${relativePath} uses stale repo owner URL`);
  assert(!contents.includes("[TODO:"), `${relativePath} contains TODO placeholder metadata`);
}

async function scanPackagedText(pluginRoot) {
  const files = await listFiles(pluginRoot);
  for (const file of files) {
    const buffer = await readFile(path.join(pluginRoot, file));
    if (buffer.includes(0)) continue;
    assertNoBadText(file, buffer.toString("utf8"));
  }
  return files;
}

function parseFrontmatter(contents, skillName) {
  assert(contents.startsWith("---\n"), `skill ${skillName} must start with frontmatter`);
  const end = contents.indexOf("\n---", 4);
  assert(end !== -1, `skill ${skillName} frontmatter must close`);
  const frontmatter = contents.slice(4, end).split("\n");
  const values = new Map();
  for (const line of frontmatter) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) values.set(match[1], match[2].trim().replace(/^["']|["']$/g, ""));
  }
  assert(values.get("name"), `skill ${skillName} frontmatter name required`);
  assert(values.get("description"), `skill ${skillName} frontmatter description required`);
  assert(values.get("name") === skillName, `skill ${skillName} frontmatter name must match folder`);
}

async function validateSkills(pluginRoot, manifest) {
  const skillsRoot = resolveRelative(pluginRoot, manifest.skills, "plugin.json skills");
  await assertPathExists(skillsRoot, "plugin.json skills", "dir");
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
  assert(skillDirs.length > 0, "plugin package must include at least one skill");

  for (const skillDir of skillDirs) {
    const skillRoot = path.join(skillsRoot, skillDir.name);
    const skillFile = path.join(skillRoot, "SKILL.md");
    await assertPathExists(skillFile, `skill ${skillDir.name} SKILL.md`, "file");
    const skillContents = await readFile(skillFile, "utf8");
    parseFrontmatter(skillContents, skillDir.name);
    for (const requiredFile of REQUIRED_SKILL_FILES) {
      await assertPathExists(path.join(skillRoot, requiredFile), `skill ${skillDir.name} ${requiredFile}`, "file");
    }
  }
}

async function validateManifest(pluginRoot) {
  const manifestDir = path.join(pluginRoot, ".codex-plugin");
  await assertPathExists(manifestDir, ".codex-plugin", "dir");
  const manifestEntries = await readdir(manifestDir);
  assert(manifestEntries.length === 1 && manifestEntries[0] === "plugin.json", ".codex-plugin must contain only plugin.json");

  const manifestPath = path.join(manifestDir, "plugin.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert(manifest.name === PLUGIN_NAME, "plugin.json name must match plugin folder");
  assert(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(manifest.version), "plugin.json version must be semver");
  assert(manifest.repository === "https://github.com/nijanthan-dev/viewfoundry-swiftui", "plugin.json repository must use current repo URL");
  assert(manifest.homepage === "https://github.com/nijanthan-dev/viewfoundry-swiftui", "plugin.json homepage must use current repo URL");
  assert(manifest.author?.name, "plugin.json author.name required");
  assert(manifest.license === "MIT", "plugin.json license must be MIT");
  assert(Array.isArray(manifest.keywords) && manifest.keywords.length > 0, "plugin.json keywords required");
  assert(manifest.interface?.displayName, "plugin.json interface.displayName required");
  assert(Array.isArray(manifest.interface?.defaultPrompt), "plugin.json interface.defaultPrompt must be an array");
  assert(manifest.interface.defaultPrompt.length > 0, "plugin.json interface.defaultPrompt required");
  assert(Array.isArray(manifest.interface?.capabilities), "plugin.json interface.capabilities must be an array");

  await validateSkills(pluginRoot, manifest);

  for (const [field, value] of Object.entries({
    apps: manifest.apps,
    mcpServers: typeof manifest.mcpServers === "string" ? manifest.mcpServers : undefined,
    composerIcon: manifest.interface?.composerIcon,
    logo: manifest.interface?.logo,
  })) {
    if (value === undefined) continue;
    const resolved = resolveRelative(pluginRoot, value, `plugin.json ${field}`);
    await assertPathExists(resolved, `plugin.json ${field}`);
  }
  for (const [index, screenshot] of (manifest.interface?.screenshots ?? []).entries()) {
    const resolved = resolveRelative(pluginRoot, screenshot, `plugin.json interface.screenshots[${index}]`);
    await assertPathExists(resolved, `plugin.json interface.screenshots[${index}]`, "file");
  }
}

async function validateMarketplace() {
  const marketplace = await readJson(MARKETPLACE_PATH);
  assert(marketplace.name === PLUGIN_NAME, "marketplace name must match repo plugin");
  assert(marketplace.interface?.displayName === "ViewFoundry SwiftUI", "marketplace displayName required");
  assert(Array.isArray(marketplace.plugins), "marketplace plugins must be an array");
  const entry = marketplace.plugins.find((plugin) => plugin?.name === PLUGIN_NAME);
  assert(entry, "marketplace entry missing");
  assert(entry.source?.source === "local", "marketplace source must be local");
  assert(entry.source?.path === `./plugins/${PLUGIN_NAME}`, "marketplace source path must target plugin root");
  assert(INSTALL_POLICIES.has(entry.policy?.installation), "marketplace installation policy invalid");
  assert(AUTH_POLICIES.has(entry.policy?.authentication), "marketplace authentication policy invalid");
  assert(entry.category === "Developer Tools", "marketplace category must be Developer Tools");
  const resolvedSource = path.resolve(repoRoot, entry.source.path);
  assert(inside(repoRoot, resolvedSource), "marketplace source path must stay in repo");
  await assertPathExists(resolvedSource, "marketplace source path", "dir");
}

async function validateRepoPlugin() {
  assert(!existsSync(path.join(repoRoot, ".codex-plugin")), "root .codex-plugin must not exist; plugin root is plugins/viewfoundry-swiftui");
  assert(!existsSync(path.join(repoRoot, "skills")), "root skills must not exist; plugin skills live under plugins/viewfoundry-swiftui");
  const pluginRoot = path.join(repoRoot, PLUGIN_ROOT);
  await assertPathExists(pluginRoot, "plugin root", "dir");
  await validateMarketplace();
  await validateManifest(pluginRoot);
  const files = await scanPackagedText(pluginRoot);
  assert(files.includes(".codex-plugin/plugin.json"), "package contents missing manifest");
  assert(files.includes("skills/viewfoundry/SKILL.md"), "package contents missing skill");
  return files;
}

async function smoke() {
  const sourceFiles = await validateRepoPlugin();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "viewfoundry-plugin-"));
  try {
    const packageRoot = path.join(tempRoot, "package", PLUGIN_NAME);
    const installedRoot = path.join(tempRoot, "codex-home", "plugins", PLUGIN_NAME);
    await cp(path.join(repoRoot, PLUGIN_ROOT), packageRoot, { recursive: true });
    await validateManifest(packageRoot);
    const packageFiles = await listFiles(packageRoot);
    assert(JSON.stringify(packageFiles) === JSON.stringify(sourceFiles), "package contents changed during package smoke");
    await cp(packageRoot, installedRoot, { recursive: true });
    await validateManifest(installedRoot);
    await scanPackagedText(installedRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

try {
  if (mode === "validate") {
    await validateRepoPlugin();
    console.log("Plugin validation passed.");
  } else if (mode === "smoke") {
    await smoke();
    console.log("Plugin package/install smoke passed.");
  } else {
    fail(`Unknown mode: ${mode}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
