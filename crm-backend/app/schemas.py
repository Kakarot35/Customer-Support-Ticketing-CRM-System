from typing import List, Literal, Optional

from pydantic import BaseModel, Field


TicketStatus = Literal["Open", "In Progress", "Closed"]
UserRole = Literal["admin", "customer"]


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    email: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: str


# ── Ticket Schemas ────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    customer_email: str = Field(min_length=3, max_length=254)
    subject: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=4000)
    priority: Optional[str] = "Medium"


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: str


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: TicketStatus
    priority: str
    created_at: str
    updated_at: str


class NoteRead(BaseModel):
    id: int
    note_text: str
    author: str
    is_internal: int
    created_at: str


class TicketDetail(TicketListItem):
    description: str
    notes: List[NoteRead] = Field(default_factory=list)


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    notes: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    author: Optional[str] = "Agent"
    is_internal: Optional[bool] = False


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: str


class CustomerTicketLookup(BaseModel):
    ticket_id: str
    customer_email: str


class StatsResponse(BaseModel):
    total: int
    open: int
    in_progress: int
    closed: int
