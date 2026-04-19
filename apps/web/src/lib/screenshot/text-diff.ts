// Text-based change detection using line-by-line diff
// No heavy dependencies — pure JS implementation

export interface TextDiffResult {
  hasChanged: boolean;
  unifiedDiff: string;        // raw unified diff string for storage
  changedSections: DiffSection[]; // structured sections for UI display
  addedLines: number;
  removedLines: number;
  unchangedLines: number;
}

export interface DiffSection {
  type: "added" | "removed" | "unchanged";
  lines: string[];
  startLine: number;
}

/**
 * Pure JS Myers diff — no external library needed.
 * Returns line-level operations: [type, line]
 * type: 0 = unchanged, 1 = added, -1 = removed
 */
function diffLines(
  oldText: string,
  newText: string
): Array<{ op: 0 | 1 | -1; line: string }> {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const m = oldLines.length;
  const n = newLines.length;

  // LCS-based diff (simple DP approach, fast for text pages)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: Array<{ op: 0 | 1 | -1; line: string }> = [];
  let i = 0;
  let j = 0;

  while (i < m || j < n) {
    if (i < m && j < n && oldLines[i] === newLines[j]) {
      result.push({ op: 0, line: oldLines[i] });
      i++;
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ op: 1, line: newLines[j] });
      j++;
    } else {
      result.push({ op: -1, line: oldLines[i] });
      i++;
    }
  }

  return result;
}

export function computeTextDiff(oldText: string, newText: string): TextDiffResult {
  if (oldText === newText) {
    return {
      hasChanged: false,
      unifiedDiff: "",
      changedSections: [],
      addedLines: 0,
      removedLines: 0,
      unchangedLines: oldText.split("\n").length,
    };
  }

  const ops = diffLines(oldText, newText);

  let addedLines = 0;
  let removedLines = 0;
  let unchangedLines = 0;

  // Build unified diff string
  const diffLines2: string[] = [];
  for (const { op, line } of ops) {
    if (op === 1) { diffLines2.push(`+ ${line}`); addedLines++; }
    else if (op === -1) { diffLines2.push(`- ${line}`); removedLines++; }
    else { diffLines2.push(`  ${line}`); unchangedLines++; }
  }

  const unifiedDiff = diffLines2.join("\n");

  // Build structured sections for UI (group consecutive same-type lines)
  // Only include context: show changed lines + 2 surrounding lines each side
  const CONTEXT = 2;
  const changedSections: DiffSection[] = [];

  // Find changed line indices
  const changedIdx = new Set<number>();
  ops.forEach((op, idx) => {
    if (op.op !== 0) {
      for (let c = Math.max(0, idx - CONTEXT); c <= Math.min(ops.length - 1, idx + CONTEXT); c++) {
        changedIdx.add(c);
      }
    }
  });

  let currentSection: DiffSection | null = null;

  ops.forEach((op, idx) => {
    if (!changedIdx.has(idx)) {
      if (currentSection) {
        changedSections.push(currentSection);
        currentSection = null;
      }
      return;
    }

    const type = op.op === 1 ? "added" : op.op === -1 ? "removed" : "unchanged";

    if (!currentSection || currentSection.type !== type) {
      if (currentSection) changedSections.push(currentSection);
      currentSection = { type, lines: [op.line], startLine: idx + 1 };
    } else {
      currentSection.lines.push(op.line);
    }
  });

  if (currentSection) changedSections.push(currentSection);

  return {
    hasChanged: true,
    unifiedDiff,
    changedSections,
    addedLines,
    removedLines,
    unchangedLines,
  };
}
