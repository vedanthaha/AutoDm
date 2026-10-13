/**
 * Database-backed Idempotency Ledger with Atomic Unique Constraint
 *
 * Replaces naive JSON files with an atomic SQL unique constraint on `comment_id`.
 * Prevents race conditions and duplicate DMs during Meta webhook retries.
 *
 * State transitions:
 * - claimComment(): atomically inserts comment with status 'pending' (fails on duplicate comment_id)
 * - markDelivered(): marks record as 'delivered' with Meta message_id
 * - markFailed(): marks record as 'failed' with Meta error code and message (NOT marked successful)
 */

const path = require('path');
const fs = require('fs');

class IdempotencyLedger {
  constructor(dbPath = path.join(__dirname, 'ledger.sqlite')) {
    this.dbPath = dbPath;
    this.useSqlite = true;
    this.init();
  }

  init() {
    try {
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(this.dbPath);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS comment_dispatches (
          comment_id TEXT PRIMARY KEY,
          author_username TEXT,
          media_id TEXT,
          keyword_matched TEXT,
          status TEXT NOT NULL, -- 'pending', 'delivered', 'failed', 'ignored'
          meta_message_id TEXT,
          meta_recipient_id TEXT,
          error_code INTEGER,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_status ON comment_dispatches(status);
      `);
      this.useSqlite = true;
    } catch (err) {
      console.warn('[Ledger] node:sqlite initialization error, falling back to memory/atomic state:', err.message);
      this.useSqlite = false;
      this.fallbackStore = new Map();
    }
  }

  /**
   * Attempts to atomically claim a comment.
   * Returns: { claimed: boolean, existingRecord: object | null }
   */
  claimComment(commentId, authorUsername, mediaId, keyword) {
    if (this.useSqlite) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO comment_dispatches (comment_id, author_username, media_id, keyword_matched, status, updated_at)
          VALUES (?, ?, ?, ?, 'pending', datetime('now'))
        `);
        stmt.run(commentId, authorUsername || 'unknown', mediaId || 'unknown', keyword || '');
        return { claimed: true, existingRecord: null };
      } catch (err) {
        // Unique constraint violation (code SQLITE_CONSTRAINT_PRIMARYKEY or message contains UNIQUE constraint)
        const checkStmt = this.db.prepare(`SELECT * FROM comment_dispatches WHERE comment_id = ?`);
        const existing = checkStmt.get(commentId);
        return { claimed: false, existingRecord: existing };
      }
    } else {
      if (this.fallbackStore.has(commentId)) {
        return { claimed: false, existingRecord: this.fallbackStore.get(commentId) };
      }
      const record = {
        comment_id: commentId,
        author_username: authorUsername,
        media_id: mediaId,
        keyword_matched: keyword,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.fallbackStore.set(commentId, record);
      return { claimed: true, existingRecord: null };
    }
  }

  /**
   * Mark comment as successfully delivered by Meta API
   */
  markDelivered(commentId, metaMessageId, recipientId) {
    if (this.useSqlite) {
      const stmt = this.db.prepare(`
        UPDATE comment_dispatches
        SET status = 'delivered', meta_message_id = ?, meta_recipient_id = ?, updated_at = datetime('now')
        WHERE comment_id = ?
      `);
      stmt.run(metaMessageId || null, recipientId || null, commentId);
    } else if (this.fallbackStore?.has(commentId)) {
      const rec = this.fallbackStore.get(commentId);
      rec.status = 'delivered';
      rec.meta_message_id = metaMessageId;
      rec.meta_recipient_id = recipientId;
      rec.updated_at = new Date().toISOString();
    }
  }

  /**
   * Mark comment dispatch as failed (safely handles failures without permanent success marking)
   */
  markFailed(commentId, errorCode, errorMessage) {
    if (this.useSqlite) {
      const stmt = this.db.prepare(`
        UPDATE comment_dispatches
        SET status = 'failed', error_code = ?, error_message = ?, retry_count = retry_count + 1, updated_at = datetime('now')
        WHERE comment_id = ?
      `);
      stmt.run(errorCode || 0, errorMessage ? String(errorMessage).slice(0, 500) : 'Unknown error', commentId);
    } else if (this.fallbackStore?.has(commentId)) {
      const rec = this.fallbackStore.get(commentId);
      rec.status = 'failed';
      rec.error_code = errorCode;
      rec.error_message = errorMessage;
      rec.retry_count = (rec.retry_count || 0) + 1;
      rec.updated_at = new Date().toISOString();
    }
  }

  /**
   * Fetch dispatch record for auditing/inspection
   */
  getRecord(commentId) {
    if (this.useSqlite) {
      const stmt = this.db.prepare(`SELECT * FROM comment_dispatches WHERE comment_id = ?`);
      return stmt.get(commentId) || null;
    }
    return this.fallbackStore?.get(commentId) || null;
  }

  /**
   * List recent dispatches
   */
  listRecent(limit = 10) {
    if (this.useSqlite) {
      const stmt = this.db.prepare(`SELECT * FROM comment_dispatches ORDER BY updated_at DESC LIMIT ?`);
      return stmt.all(limit);
    }
    return Array.from(this.fallbackStore.values()).slice(-limit);
  }
}

module.exports = { IdempotencyLedger };
