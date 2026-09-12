from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any, Union
from datetime import datetime, date, time
from enum import Enum


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Committee Schemas ────────────────────────────────────────────────────────

class CommitteeCreate(BaseModel):
    name: str
    code: str
    authority: Optional[str] = None
    mandate: Optional[str] = None
    description: Optional[str] = None
    quorum_type: str = "FIXED"
    quorum_value: int = 3
    meeting_frequency: int = 1
    frequency_unit: str = "MONTH"
    status: str = "ACTIVE"


class CommitteeUpdate(BaseModel):
    name: Optional[str] = None
    authority: Optional[str] = None
    mandate: Optional[str] = None
    description: Optional[str] = None
    quorum_type: Optional[str] = None
    quorum_value: Optional[int] = None
    meeting_frequency: Optional[int] = None
    frequency_unit: Optional[str] = None
    status: Optional[str] = None


class CommitteeOut(BaseModel):
    id: str
    name: str
    code: str
    authority: Optional[str] = None
    mandate: Optional[str] = None
    description: Optional[str] = None
    quorum_type: str
    quorum_value: int
    meeting_frequency: int
    frequency_unit: str
    status: str
    created_at: Optional[datetime] = None
    member_count: Optional[int] = 0
    last_meeting_date: Optional[date] = None
    next_meeting_date: Optional[date] = None
    compliance_status: Optional[str] = None
    compliance_score: Optional[float] = None

    class Config:
        from_attributes = True


# ─── Committee Requirement Schemas ────────────────────────────────────────────

class RequirementCreate(BaseModel):
    requirement_type: str
    description: str
    required_count: Optional[int] = None
    required_role: Optional[str] = None
    required_gender: Optional[str] = None
    requires_external: bool = False
    requires_student: bool = False
    minimum_percentage: Optional[float] = None
    source_reference: Optional[str] = None


class RequirementOut(BaseModel):
    id: str
    committee_id: str
    requirement_type: str
    description: str
    required_count: Optional[int] = None
    required_role: Optional[str] = None
    required_gender: Optional[str] = None
    requires_external: bool
    requires_student: bool
    minimum_percentage: Optional[float] = None
    source_reference: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Member Schemas ───────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    organization: Optional[str] = None
    member_type: str = "FACULTY"
    gender: Optional[str] = None
    is_external: bool = False
    is_student: bool = False


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    organization: Optional[str] = None
    member_type: Optional[str] = None
    gender: Optional[str] = None
    is_external: Optional[bool] = None
    is_student: Optional[bool] = None
    status: Optional[str] = None


class MemberOut(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    organization: Optional[str] = None
    member_type: str
    gender: Optional[str] = None
    is_external: bool
    is_student: bool
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Committee Member Schemas ─────────────────────────────────────────────────

class CommitteeMemberAdd(BaseModel):
    member_id: str
    role: Optional[str] = "MEMBER"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    appointment_reference: Optional[str] = None


class CommitteeMemberUpdate(BaseModel):
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    appointment_reference: Optional[str] = None


class CommitteeMemberOut(BaseModel):
    id: str
    committee_id: str
    member_id: str
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool
    appointment_reference: Optional[str] = None
    created_at: Optional[datetime] = None
    member: Optional[MemberOut] = None
    tenure_status: Optional[str] = None
    days_remaining: Optional[int] = None

    class Config:
        from_attributes = True


# ─── Meeting Schemas ──────────────────────────────────────────────────────────

class MeetingCreate(BaseModel):
    committee_id: str
    title: str
    meeting_number: Optional[Union[str, int]] = None
    meeting_date: Optional[Union[date, str]] = None
    start_time: Optional[Union[time, str]] = None
    end_time: Optional[Union[time, str]] = None
    location: Optional[str] = None
    meeting_mode: str = "OFFLINE"
    meeting_link: Optional[str] = None
    agenda_text: Optional[str] = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_optional_time(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                parts = v.strip().split(":")
                if len(parts) == 2:
                    return time(int(parts[0]), int(parts[1]))
                elif len(parts) == 3:
                    return time(int(parts[0]), int(parts[1]), int(parts[2]))
            except Exception:
                return None
        return v

    @field_validator("meeting_date", mode="before")
    @classmethod
    def parse_optional_date(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                return date.fromisoformat(v.strip())
            except Exception:
                return None
        return v

    @field_validator("meeting_number", mode="before")
    @classmethod
    def normalize_meeting_number(cls, v):
        if v == "" or v is None:
            return None
        return str(v).strip()


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_number: Optional[Union[str, int]] = None
    meeting_date: Optional[Union[date, str]] = None
    start_time: Optional[Union[time, str]] = None
    end_time: Optional[Union[time, str]] = None
    location: Optional[str] = None
    meeting_mode: Optional[str] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None
    agenda_text: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_optional_time(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                parts = v.strip().split(":")
                if len(parts) == 2:
                    return time(int(parts[0]), int(parts[1]))
                elif len(parts) == 3:
                    return time(int(parts[0]), int(parts[1]), int(parts[2]))
            except Exception:
                return None
        return v

    @field_validator("meeting_date", mode="before")
    @classmethod
    def parse_optional_date(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                return date.fromisoformat(v.strip())
            except Exception:
                return None
        return v

    @field_validator("meeting_number", mode="before")
    @classmethod
    def normalize_meeting_number(cls, v):
        if v == "" or v is None:
            return None
        return str(v).strip()


class MeetingOut(BaseModel):
    id: str
    committee_id: str
    title: str
    meeting_number: Optional[Union[str, int]] = None
    meeting_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    meeting_mode: str
    meeting_link: Optional[str] = None
    status: str
    agenda_text: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    committee_name: Optional[str] = None
    quorum_met: Optional[bool] = None

    class Config:
        from_attributes = True


# ─── Attendance Schemas ───────────────────────────────────────────────────────

class AttendanceRecord(BaseModel):
    member_id: str
    attendance_status: str
    remarks: Optional[str] = None


class AttendanceBulk(BaseModel):
    records: List[AttendanceRecord]


class AttendanceOut(BaseModel):
    id: str
    meeting_id: str
    member_id: str
    attendance_status: str
    remarks: Optional[str] = None
    member: Optional[MemberOut] = None

    class Config:
        from_attributes = True


# ─── Quorum Schemas ───────────────────────────────────────────────────────────

class QuorumValidate(BaseModel):
    override_reason: Optional[str] = None


class QuorumOut(BaseModel):
    meeting_id: str
    required_count: int
    eligible_count: int
    present_count: int
    quorum_met: bool
    override_allowed: bool
    override_reason: Optional[str] = None
    validated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Agenda Schemas ───────────────────────────────────────────────────────────

class AgendaItemCreate(BaseModel):
    item_number: int
    title: str
    description: Optional[str] = None
    source: str = "MANUAL"
    priority: str = "MEDIUM"


class AgendaCreate(BaseModel):
    title: str
    content: Optional[str] = None
    items: Optional[List[AgendaItemCreate]] = []


class AgendaOut(BaseModel):
    id: str
    meeting_id: str
    title: str
    version: int
    content: Optional[str] = None
    generated_by_ai: bool
    created_at: Optional[datetime] = None
    items: Optional[List[dict]] = []

    class Config:
        from_attributes = True


# ─── Minutes Schemas ──────────────────────────────────────────────────────────

class MinutesCreate(BaseModel):
    meeting_id: str
    summary: Optional[str] = None
    discussion: Optional[str] = None
    decisions: Optional[str] = None
    conclusion: Optional[str] = None
    next_meeting_date: Optional[date] = None


class MinutesUpdate(BaseModel):
    summary: Optional[str] = None
    discussion: Optional[str] = None
    decisions: Optional[str] = None
    conclusion: Optional[str] = None
    next_meeting_date: Optional[date] = None
    status: Optional[str] = None


class MinutesGenerateRequest(BaseModel):
    meeting_id: str
    notes: str
    committee_id: Optional[str] = None


class MinutesOut(BaseModel):
    id: str
    meeting_id: str
    summary: Optional[str] = None
    discussion: Optional[str] = None
    decisions: Optional[str] = None
    conclusion: Optional[str] = None
    next_meeting_date: Optional[date] = None
    status: str
    generated_by_ai: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    sections: Optional[List[dict]] = []

    class Config:
        from_attributes = True


# ─── Action Item Schemas ──────────────────────────────────────────────────────

class ActionItemCreate(BaseModel):
    committee_id: Optional[str] = None
    meeting_id: Optional[str] = None
    minute_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = "MEDIUM"


class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class ActionItemOut(BaseModel):
    id: str
    committee_id: Optional[str] = None
    meeting_id: Optional[str] = None
    minute_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    due_date: Optional[date] = None
    priority: str
    status: str
    remarks: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    owner: Optional[MemberOut] = None
    committee_name: Optional[str] = None
    is_overdue: Optional[bool] = None

    class Config:
        from_attributes = True


# ─── Compliance Schemas ───────────────────────────────────────────────────────

class ComplianceCheckOut(BaseModel):
    id: str
    committee_id: str
    committee_name: Optional[str] = None
    overall_score: float
    status: str
    composition_score: Optional[float] = None
    tenure_score: Optional[float] = None
    meeting_score: Optional[float] = None
    quorum_score: Optional[float] = None
    summary: Optional[str] = None
    checked_at: Optional[datetime] = None
    issues: Optional[List[dict]] = []

    class Config:
        from_attributes = True


# ─── Document Schemas ─────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    name: str
    original_filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    cloudinary_url: Optional[str] = None
    category: str
    description: Optional[str] = None
    committee_id: Optional[str] = None
    meeting_id: Optional[str] = None
    is_indexed: bool
    created_at: Optional[datetime] = None
    committee_name: Optional[str] = None
    uploaded_by_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── AI Schemas ───────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    committee_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sources: Optional[List[str]] = []
    tools_used: Optional[List[str]] = []


class GenerateAgendaRequest(BaseModel):
    meeting_id: str
    additional_topics: Optional[List[str]] = []


class GenerateMinutesRequest(BaseModel):
    meeting_id: str
    notes: str


class ExtractActionsRequest(BaseModel):
    meeting_id: str
    text: str
    committee_id: Optional[str] = None


# ─── Notification Schemas ─────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_committees: int
    compliant_committees: int
    warning_committees: int
    non_compliant_committees: int
    overdue_meetings: int
    active_members: int
    open_action_items: int
    overdue_action_items: int


class ReportFilter(BaseModel):
    committee_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
