#!/usr/bin/env bash
# Batch digest runner: generates zh + en digests for a date range.
# Usage: ./scripts/batch-digest.sh [START_DATE] [END_DATE] [TOP_N]
#   defaults: 2026-01-01  2026-02-25  30
#
# - Skips dates whose output files already exist
# - RSS fetched once per day, cached, reused for zh + en
# - Failures logged but never stop the loop

set -uo pipefail

START_DATE="${1:-2026-01-01}"
END_DATE="${2:-2026-02-25}"
TOP_N="${3:-30}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CACHE_DIR="$PROJECT_DIR/.cache"
DOCS_DIR="$PROJECT_DIR/web/docs"
LOG_FILE="$PROJECT_DIR/batch-digest.log"

mkdir -p "$CACHE_DIR" "$DOCS_DIR"

log() {
  local msg="[$(date '+%H:%M:%S')] $*"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

# generate date sequence (macOS + Linux compatible)
dates=()
current="$START_DATE"
while [[ "$current" < "$END_DATE" ]] || [[ "$current" == "$END_DATE" ]]; do
  dates+=("$current")
  if date -v+1d &>/dev/null; then
    # macOS
    current=$(date -j -v+1d -f "%Y-%m-%d" "$current" "+%Y-%m-%d")
  else
    # Linux
    current=$(date -d "$current + 1 day" "+%Y-%m-%d")
  fi
done

total=${#dates[@]}
log "=== Batch Digest: $START_DATE → $END_DATE ($total days, top-n=$TOP_N) ==="
log "Log file: $LOG_FILE"

ok=0
skipped=0
failed=0

for i in "${!dates[@]}"; do
  d="${dates[$i]}"
  n=$((i + 1))
  file_date="${d//-/_}"
  zh_file="$DOCS_DIR/${file_date}.md"
  en_file="$DOCS_DIR/${file_date}_en.md"
  cache_file="$CACHE_DIR/cache-${file_date}.json"

  # skip if both zh + en already exist
  if [[ -f "$zh_file" ]] && [[ -f "$en_file" ]]; then
    log "[$n/$total] $d — SKIP (both files exist)"
    skipped=$((skipped + 1))
    continue
  fi

  log "[$n/$total] $d — START"

  # Step 1: fetch RSS cache (if not already cached)
  if [[ ! -f "$cache_file" ]]; then
    log "  Fetching RSS → $cache_file"
    if ! bun "$SCRIPT_DIR/digest.ts" --date "$d" --fetch-only --output "$cache_file" >> "$LOG_FILE" 2>&1; then
      log "  ✗ RSS fetch failed, skipping this date"
      failed=$((failed + 1))
      continue
    fi
  else
    log "  RSS cache exists, reusing"
  fi

  # Step 2: generate zh digest (skip if exists)
  if [[ -f "$zh_file" ]]; then
    log "  zh — SKIP (exists)"
  else
    log "  zh — generating..."
    if bun "$SCRIPT_DIR/digest.ts" --cache "$cache_file" --top-n "$TOP_N" --lang zh --output "$zh_file" >> "$LOG_FILE" 2>&1; then
      log "  zh — OK"
    else
      log "  zh — FAILED"
      failed=$((failed + 1))
    fi
  fi

  # Step 3: generate en digest (skip if exists)
  if [[ -f "$en_file" ]]; then
    log "  en — SKIP (exists)"
  else
    log "  en — generating..."
    if bun "$SCRIPT_DIR/digest.ts" --cache "$cache_file" --top-n "$TOP_N" --lang en --output "$en_file" >> "$LOG_FILE" 2>&1; then
      log "  en — OK"
    else
      log "  en — FAILED"
      failed=$((failed + 1))
    fi
  fi

  ok=$((ok + 1))
  log "[$n/$total] $d — DONE"
done

log ""
log "=== FINISHED ==="
log "  Total: $total days"
log "  Processed: $ok"
log "  Skipped: $skipped"
log "  Failures: $failed"
log "  Log: $LOG_FILE"
