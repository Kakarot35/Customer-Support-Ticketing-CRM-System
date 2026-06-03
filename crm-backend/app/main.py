from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import create_access_token, verify_password
from app.database import get_db, init_db
from app.dependencies import get_current_user, require_admin, require_customer
from app.repository import (
    create_ticket, create_user, get_stats, get_ticket,
    get_user_by_email, get_user_by_id, list_tickets, update_ticket,
)
from app.schemas import (
    CustomerTicketLookup, StatsResponse, TicketCreate, TicketCreateResponse,
    TicketDetail, TicketListItem, TicketStatus, TicketUpdate, TicketUpdateResponse,
    TokenResponse, UserLogin, UserOut, UserRegister,
)
from app.seed import seed_users

app = FastAPI(
    title="Support CRM API",
    description="FastAPI + SQLite with JWT auth. Admin and Customer portals.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    seed_users()


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": "2.0.0"}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse, status_code=201, tags=["Auth"])
def register(payload: UserRegister):
    """Register a new customer account."""
    with get_db() as db:
        if get_user_by_email(db, payload.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        from app.auth import hash_password
        user = create_user(db, payload.name, payload.email, hash_password(payload.password), role="customer")
    token = create_access_token(user["id"], user["email"], user["role"])
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "name": user["name"], "email": user["email"]}


@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(payload: UserLogin):
    """Login — returns JWT token + role so frontend knows where to redirect."""
    with get_db() as db:
        user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "name": user["name"], "email": user["email"]}


@app.get("/api/auth/me", response_model=UserOut, tags=["Auth"])
def me(current_user: dict = Depends(get_current_user)):
    """Get logged-in user profile."""
    with get_db() as db:
        user = get_user_by_id(db, int(current_user["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Customer ──────────────────────────────────────────────────────────────────

@app.post("/api/customer/tickets", response_model=TicketCreateResponse, status_code=201, tags=["Customer"])
def customer_create_ticket(payload: TicketCreate, current_user: dict = Depends(require_customer)):
    """Create a ticket. Customer only."""
    with get_db() as db:
        return create_ticket(db, payload, customer_id=int(current_user["sub"]))


@app.get("/api/customer/tickets", response_model=List[TicketListItem], tags=["Customer"])
def customer_list_tickets(
    status_filter: Optional[TicketStatus] = Query(default=None, alias="status"),
    current_user: dict = Depends(require_customer),
):
    """List only this customer's own tickets."""
    with get_db() as db:
        return list_tickets(db, status=status_filter, customer_id=int(current_user["sub"]))


@app.get("/api/customer/tickets/{ticket_id}", response_model=TicketDetail, tags=["Customer"])
def customer_get_ticket(ticket_id: str, current_user: dict = Depends(require_customer)):
    """View a specific ticket. Customer can only see their own."""
    with get_db() as db:
        ticket = get_ticket(db, ticket_id, customer_id=int(current_user["sub"]))
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.post("/api/customer/tickets/lookup", response_model=TicketDetail, tags=["Customer"])
def customer_lookup_ticket(payload: CustomerTicketLookup):
    """Look up ticket by ID + email. No login required."""
    with get_db() as db:
        ticket = get_ticket(db, payload.ticket_id, customer_email=payload.customer_email)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found for this email")
    return ticket


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.get("/api/admin/tickets/stats", response_model=StatsResponse, tags=["Admin"])
def admin_stats(current_user: dict = Depends(require_admin)):
    """Dashboard stats. Admin only."""
    with get_db() as db:
        return get_stats(db)


@app.get("/api/admin/tickets", response_model=List[TicketListItem], tags=["Admin"])
def admin_list_tickets(
    status_filter: Optional[TicketStatus] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None, min_length=1),
    current_user: dict = Depends(require_admin),
):
    """List all tickets with search + filter. Admin only."""
    with get_db() as db:
        return list_tickets(db, status=status_filter, search=search)


@app.get("/api/admin/tickets/{ticket_id}", response_model=TicketDetail, tags=["Admin"])
def admin_get_ticket(ticket_id: str, current_user: dict = Depends(require_admin)):
    """Full ticket details. Admin only."""
    with get_db() as db:
        ticket = get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.put("/api/admin/tickets/{ticket_id}", response_model=TicketUpdateResponse, tags=["Admin"])
def admin_update_ticket(ticket_id: str, payload: TicketUpdate, current_user: dict = Depends(require_admin)):
    """Update status / add note. Admin only."""
    if payload.status is None and not payload.notes:
        raise HTTPException(status_code=400, detail="Provide status or notes")
    with get_db() as db:
        result = update_ticket(db, ticket_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return result


@app.delete("/api/admin/tickets/{ticket_id}", tags=["Admin"])
def admin_delete_ticket(ticket_id: str, current_user: dict = Depends(require_admin)):
    """Delete a ticket. Admin only."""
    with get_db() as db:
        if not get_ticket(db, ticket_id):
            raise HTTPException(status_code=404, detail="Ticket not found")
        db.execute("DELETE FROM tickets WHERE ticket_id = ?", (ticket_id,))
    return {"success": True, "message": f"{ticket_id} deleted"}


# ── Assessment compatibility (no auth required, matches PDF spec) ─────────────

@app.post("/api/tickets", response_model=TicketCreateResponse, status_code=201, tags=["Assessment API"])
def create_ticket_compat(payload: TicketCreate):
    with get_db() as db:
        return create_ticket(db, payload)


@app.get("/api/tickets", response_model=List[TicketListItem], tags=["Assessment API"])
def list_tickets_compat(
    status_filter: Optional[TicketStatus] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None, min_length=1),
):
    with get_db() as db:
        return list_tickets(db, status=status_filter, search=search)


@app.get("/api/tickets/{ticket_id}", response_model=TicketDetail, tags=["Assessment API"])
def get_ticket_compat(ticket_id: str):
    with get_db() as db:
        ticket = get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.put("/api/tickets/{ticket_id}", response_model=TicketUpdateResponse, tags=["Assessment API"])
def update_ticket_compat(ticket_id: str, payload: TicketUpdate):
    if payload.status is None and not payload.notes:
        raise HTTPException(status_code=400, detail="Provide status or notes")
    with get_db() as db:
        result = update_ticket(db, ticket_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return result
