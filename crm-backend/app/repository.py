import sqlite3
from typing import Any, Optional

from app.schemas import TicketCreate, TicketUpdate


def _row(row: Optional[sqlite3.Row]) -> Optional[dict]:
    return dict(row) if row else None


# ── User queries ──────────────────────────────────────────────────────────────

def get_user_by_email(db: sqlite3.Connection, email: str) -> Optional[dict]:
    row = db.execute(
        "SELECT * FROM users WHERE LOWER(email) = ?", (email.lower(),)
    ).fetchone()
    return _row(row)


def get_user_by_id(db: sqlite3.Connection, user_id: int) -> Optional[dict]:
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _row(row)


def create_user(db: sqlite3.Connection, name: str, email: str, password_hash: str, role: str = "customer") -> dict:
    db.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (name.strip(), email.lower(), password_hash, role),
    )
    row = db.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
        (email.lower(),),
    ).fetchone()
    return dict(row)


# ── Ticket queries ────────────────────────────────────────────────────────────

def next_ticket_id(db: sqlite3.Connection) -> str:
    row = db.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM tickets").fetchone()
    return f"TKT-{row['next_id']:03d}"


def create_ticket(db: sqlite3.Connection, payload: TicketCreate, customer_id: Optional[int] = None) -> dict:
    ticket_id = next_ticket_id(db)
    db.execute(
        """
        INSERT INTO tickets
            (ticket_id, customer_name, customer_email, customer_id, subject, description, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            ticket_id,
            payload.customer_name.strip(),
            payload.customer_email.lower(),
            customer_id,
            payload.subject.strip(),
            payload.description.strip(),
            payload.priority or "Medium",
        ),
    )
    row = db.execute(
        "SELECT ticket_id, created_at FROM tickets WHERE ticket_id = ?", (ticket_id,)
    ).fetchone()
    return dict(row)


def list_tickets(
    db: sqlite3.Connection,
    status: Optional[str] = None,
    search: Optional[str] = None,
    customer_email: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> list:
    filters = []
    params = []

    if status:
        filters.append("status = ?")
        params.append(status)

    if customer_email:
        filters.append("LOWER(customer_email) = ?")
        params.append(customer_email.lower())

    if customer_id:
        filters.append("customer_id = ?")
        params.append(customer_id)

    if search:
        like = f"%{search.lower()}%"
        filters.append(
            "(LOWER(ticket_id) LIKE ? OR LOWER(customer_name) LIKE ? "
            "OR LOWER(customer_email) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(description) LIKE ?)"
        )
        params.extend([like, like, like, like, like])

    where = f"WHERE {' AND '.join(filters)}" if filters else ""
    rows = db.execute(
        f"""
        SELECT ticket_id, customer_name, customer_email, subject,
               status, priority, created_at, updated_at
        FROM tickets {where}
        ORDER BY datetime(created_at) DESC, id DESC
        """,
        params,
    ).fetchall()
    return [dict(r) for r in rows]


def get_ticket(
    db: sqlite3.Connection,
    ticket_id: str,
    customer_email: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> Optional[dict]:
    params = [ticket_id]
    extra = ""

    if customer_email:
        extra += " AND LOWER(customer_email) = ?"
        params.append(customer_email.lower())

    if customer_id:
        extra += " AND customer_id = ?"
        params.append(customer_id)

    ticket = _row(
        db.execute(
            f"""
            SELECT ticket_id, customer_name, customer_email, subject, description,
                   status, priority, created_at, updated_at
            FROM tickets WHERE ticket_id = ? {extra}
            """,
            params,
        ).fetchone()
    )
    if not ticket:
        return None

    notes = db.execute(
        """
        SELECT n.id, n.note_text, n.author, n.is_internal, n.created_at
        FROM notes n
        JOIN tickets t ON t.id = n.ticket_ref
        WHERE t.ticket_id = ?
        ORDER BY datetime(n.created_at) ASC, n.id ASC
        """,
        (ticket_id,),
    ).fetchall()
    ticket["notes"] = [dict(n) for n in notes]
    return ticket


def update_ticket(
    db: sqlite3.Connection,
    ticket_id: str,
    payload: TicketUpdate,
) -> Optional[dict]:
    ticket = db.execute(
        "SELECT id FROM tickets WHERE ticket_id = ?", (ticket_id,)
    ).fetchone()
    if not ticket:
        return None

    if payload.status:
        db.execute(
            "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?",
            (payload.status, ticket_id),
        )

    if payload.notes and payload.notes.strip():
        db.execute(
            "INSERT INTO notes (ticket_ref, note_text, author, is_internal) VALUES (?, ?, ?, ?)",
            (ticket["id"], payload.notes.strip(), payload.author or "Agent", 1 if payload.is_internal else 0),
        )
        db.execute(
            "UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?",
            (ticket_id,),
        )

    row = db.execute(
        "SELECT updated_at FROM tickets WHERE ticket_id = ?", (ticket_id,)
    ).fetchone()
    return {"success": True, "updated_at": row["updated_at"]}


def get_stats(db: sqlite3.Connection) -> dict:
    total = db.execute("SELECT COUNT(*) as c FROM tickets").fetchone()["c"]
    open_ = db.execute("SELECT COUNT(*) as c FROM tickets WHERE status = 'Open'").fetchone()["c"]
    inp = db.execute("SELECT COUNT(*) as c FROM tickets WHERE status = 'In Progress'").fetchone()["c"]
    closed = db.execute("SELECT COUNT(*) as c FROM tickets WHERE status = 'Closed'").fetchone()["c"]
    return {"total": total, "open": open_, "in_progress": inp, "closed": closed}
