import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const progressPath = path.join(repoRoot, "agent_progress.json");
const docsPath = path.join(repoRoot, "docs", "AGENT_PROGRESS.md");

const allowedStatuses = new Set(["idle", "in-progress", "pending", "done"]);

function parseArgs(argv) {
  const values = {
    status: undefined,
    currentTask: undefined,
    owner: undefined,
    addNextStep: [],
    addCompleted: [],
    addBlocker: [],
    addFileTouched: [],
    historySummary: undefined,
    historyFiles: [],
    syncDoc: false,
    start: false
  };

  const flagsWithValue = new Set([
    "--status",
    "--current-task",
    "--owner",
    "--next-step",
    "--completed",
    "--blocker",
    "--file-touched",
    "--history-summary",
    "--history-file"
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--sync-doc") {
      values.syncDoc = true;
      continue;
    }

    if (arg === "--start") {
      values.start = true;
      continue;
    }

    if (!flagsWithValue.has(arg)) {
      throw new Error(`Unknown option: ${arg}`);
    }

    const next = argv[index + 1];
    if (!next) {
      throw new Error(`Missing value for ${arg}`);
    }

    switch (arg) {
      case "--status":
        values.status = next;
        break;
      case "--current-task":
        values.currentTask = next;
        break;
      case "--owner":
        values.owner = next;
        break;
      case "--next-step":
        values.addNextStep.push(next);
        break;
      case "--completed":
        values.addCompleted.push(next);
        break;
      case "--blocker":
        values.addBlocker.push(next);
        break;
      case "--file-touched":
        values.addFileTouched.push(next);
        break;
      case "--history-summary":
        values.historySummary = next;
        break;
      case "--history-file":
        values.historyFiles.push(next);
        break;
      default:
        break;
    }

    index += 1;
  }

  return values;
}

function normalizeArray(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

async function readProgress() {
  try {
    const raw = await fs.readFile(progressPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      status: "idle",
      currentTask: "",
      nextSteps: [],
      completedTasks: [],
      blockers: [],
      filesTouched: [],
      lastUpdated: new Date().toISOString(),
      owner: "",
      history: []
    };
  }
}

function buildHistoryEntry(values) {
  const summaryParts = [];
  if (values.status) summaryParts.push(`status=${values.status}`);
  if (values.currentTask) summaryParts.push(`currentTask=${values.currentTask}`);
  if (values.addNextStep.length) summaryParts.push(`added next steps`);
  if (values.addCompleted.length) summaryParts.push(`added completed tasks`);
  if (values.addBlocker.length) summaryParts.push(`added blockers`);
  if (values.addFileTouched.length) summaryParts.push(`updated touched files`);

  if (!values.historySummary && summaryParts.length === 0) {
    return null;
  }

  return {
    timestamp: new Date().toISOString(),
    summary: values.historySummary || `Updated progress (${summaryParts.join(", ")})`,
    files: normalizeArray(values.historyFiles)
  };
}

function formatMarkdown(progress) {
  const sections = [
    `## Current Status`,
    `
- status: ${progress.status}`
  ];

  if (progress.owner) {
    sections.push(`- owner: ${progress.owner}`);
  }

  if (progress.currentTask) {
    sections.push(`- currentTask: ${progress.currentTask}`);
  }

  sections.push(`- lastUpdated: ${progress.lastUpdated}`);

  const listBlock = (title, items) => {
    if (!items || items.length === 0) return "";
    return [`\n## ${title}`, "", ...items.map((item) => `- ${item}`)].join("\n");
  };

  const historyLines = ["\n## History", ""];
  if (progress.history.length === 0) {
    historyLines.push("- No history entries yet.");
  } else {
    for (const entry of progress.history) {
      historyLines.push(
        `- ${entry.timestamp}: ${entry.summary}`,
        ...(entry.files?.length ? entry.files.map((file) => `  - ${file}`) : [])
      );
    }
  }

  return (
    [
      sections.join("\n"),
      listBlock("Next Steps", progress.nextSteps),
      listBlock("Completed Tasks", progress.completedTasks),
      listBlock("Blockers", progress.blockers),
      listBlock("Files Touched", progress.filesTouched),
      historyLines.join("\n")
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim() + "\n"
  );
}

async function writeProgress(progress) {
  await fs.writeFile(progressPath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

async function writeDocs(progress) {
  const content = `# Agent Progress Tracking\n\nThis file is generated from \`agent_progress.json\`.\n\n## How to start a session\n\nRun a new agent session with owner identification:\n\n\`\`\`bash\nnpm run agent:start -- --owner <agent-id> --sync-doc\n\`\`\`\n\nIf you set \`AGENT_ID\` in the environment, the script uses it automatically when \`--owner\` is omitted.\n\n## How to update progress\n\nUpdate the JSON and regenerate the docs in one step:\n\n\`\`\`bash\nnpm run agent:progress -- --completed "Updated feature X" --sync-doc\n\`\`\`\n\n${formatMarkdown(progress)}`;
  await fs.writeFile(docsPath, content, "utf8");
}

async function main() {
  const values = parseArgs(process.argv.slice(2));

  if (values.status && !allowedStatuses.has(values.status)) {
    throw new Error(`Invalid status: ${values.status}. Allowed values: ${[...allowedStatuses].join(", ")}`);
  }

  const progress = await readProgress();
  const envOwner = process.env.AGENT_ID || process.env.AGENT_NAME || process.env.USER;

  if (values.start) {
    if (!values.owner) {
      values.owner = envOwner || progress.owner || "agent-unknown";
    }
    if (!values.status) {
      values.status = "in-progress";
    }
    if (!values.historySummary) {
      values.historySummary = "Started agent session";
    }
    if (!values.currentTask) {
      values.currentTask =
        progress.currentTask || (progress.nextSteps.length ? `Continue with: ${progress.nextSteps[0]}` : undefined);
    }
  }

  if (values.status) progress.status = values.status;
  if (values.currentTask) progress.currentTask = values.currentTask;
  if (values.owner) progress.owner = values.owner;
  if (values.addNextStep.length) progress.nextSteps = normalizeArray([...progress.nextSteps, ...values.addNextStep]);
  if (values.addCompleted.length)
    progress.completedTasks = normalizeArray([...progress.completedTasks, ...values.addCompleted]);
  if (values.addBlocker.length) progress.blockers = normalizeArray([...progress.blockers, ...values.addBlocker]);
  if (values.addFileTouched.length)
    progress.filesTouched = normalizeArray([...progress.filesTouched, ...values.addFileTouched]);

  if (values.historySummary) {
    progress.history.push(buildHistoryEntry(values));
  }

  progress.lastUpdated = new Date().toISOString();

  await writeProgress(progress);

  if (values.syncDoc) {
    await writeDocs(progress);
  }

  console.log(`Updated ${progressPath}${values.syncDoc ? ` and ${docsPath}` : ""}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
