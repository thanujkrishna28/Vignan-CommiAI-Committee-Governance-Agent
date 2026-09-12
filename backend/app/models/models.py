import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text, DateTime,
    ForeignKey, Enum, Date, Time, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Enums ───────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    REGISTRAR = "REGISTRAR"
    CONVENER = "CONVENER"
    MEMBER = "MEMBER"
    IQAC = "IQAC"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class CommitteeStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    UNDER_REVIEW = "UNDER_REVIEW"


class MemberType(str, enum.Enum):
    FACULTY = "FACULTY"
    ADMINISTRATION = "ADMINISTRATION"
    STUDENT = "STUDENT"
    EXTERNAL = "EXTERNAL"
    INDUSTRY = "INDUSTRY"
    ALUMNI = "ALUMNI"
    OTHER = "OTHER"


class MemberStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class RequirementType(str, enum.Enum):
    ROLE = "ROLE"
    COUNT = "COUNT"
    GENDER = "GENDER"
    EXTERNAL = "EXTERNAL"
    STUDENT = "STUDENT"
    COMPOSITION = "COMPOSITION"
    OTHER = "OTHER"


class MeetingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    OVERDUE = "OVERDUE"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    EXCUSED = "EXCUSED"


class DocumentCategory(str, enum.Enum):
    REGULATION = "REGULATION"
    POLICY = "POLICY"
    AGENDA = "AGENDA"
    MINUTES = "MINUTES"
    EVIDENCE = "EVIDENCE"
    SUPPORTING_DOCUMENT = "SUPPORTING_DOCUMENT"
    STATUTORY_ACT = "STATUTORY_ACT"
    RATIFIED_MINUTES = "RATIFIED_MINUTES"
    REGULATORY_GUIDELINE = "REGULATORY_GUIDELINE"
    POLICY_ORDER = "POLICY_ORDER"
    ACCREDITATION_EVIDENCE = "ACCREDITATION_EVIDENCE"
    OTHER = "OTHER"



class MinutesStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"


class ActionStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class ActionPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AgendaSource(str, enum.Enum):
    MANUAL = "MANUAL"
    PREVIOUS_MINUTES = "PREVIOUS_MINUTES"
    ACTION_ITEM = "ACTION_ITEM"
    COMPLIANCE = "COMPLIANCE"
    AI_GENERATED = "AI_GENERATED"
    OTHER = "OTHER"


class SectionType(str, enum.Enum):
    DISCUSSION = "DISCUSSION"
    DECISION = "DECISION"
    ACTION = "ACTION"
    OTHER = "OTHER"


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "COMPLIANT"
    WARNING = "WARNING"
    NON_COMPLIANT = "NON_COMPLIANT"


class IssueType(str, enum.Enum):
    MISSING_MEMBER = "MISSING_MEMBER"
    INVALID_COMPOSITION = "INVALID_COMPOSITION"
    TENURE_EXPIRING = "TENURE_EXPIRING"
    TENURE_EXPIRED = "TENURE_EXPIRED"
    MEETING_OVERDUE = "MEETING_OVERDUE"
    QUORUM_ISSUE = "QUORUM_ISSUE"
    DOCUMENT_MISSING = "DOCUMENT_MISSING"
    OTHER = "OTHER"


class IssueSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AccessType(str, enum.Enum):
    CONVENER = "CONVENER"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class RegulationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUPERSEDED = "SUPERSEDED"
    DRAFT = "DRAFT"


class MessageRole(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"
    TOOL = "TOOL"


class QuorumType(str, enum.Enum):
    FIXED = "FIXED"
    PERCENTAGE = "PERCENTAGE"


# ─── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.MEMBER)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    committee_access = relationship("UserCommitteeAccess", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    ai_conversations = relationship("AIConversation", back_populates="user")
    created_meetings = relationship("Meeting", back_populates="created_by_user")


class Committee(Base):
    __tablename__ = "committees"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(300), nullable=False)
    code = Column(String(50), nullable=False, unique=True, index=True)
    authority = Column(String(300), nullable=True)
    mandate = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    quorum_type = Column(Enum(QuorumType), nullable=False, default=QuorumType.FIXED)
    quorum_value = Column(Integer, nullable=False, default=3)
    meeting_frequency = Column(Integer, nullable=False, default=1)
    frequency_unit = Column(String(20), nullable=False, default="MONTH")  # WEEK, MONTH, QUARTER, YEAR
    status = Column(Enum(CommitteeStatus), nullable=False, default=CommitteeStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    requirements = relationship("CommitteeRequirement", back_populates="committee", cascade="all, delete-orphan")
    committee_members = relationship("CommitteeMember", back_populates="committee", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="committee", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="committee")
    compliance_checks = relationship("ComplianceCheck", back_populates="committee", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="committee")
    user_access = relationship("UserCommitteeAccess", back_populates="committee")


class CommitteeRequirement(Base):
    __tablename__ = "committee_requirements"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id", ondelete="CASCADE"), nullable=False)
    requirement_type = Column(Enum(RequirementType), nullable=False)
    description = Column(Text, nullable=False)
    required_count = Column(Integer, nullable=True)
    required_role = Column(String(100), nullable=True)
    required_gender = Column(String(10), nullable=True)
    requires_external = Column(Boolean, default=False)
    requires_student = Column(Boolean, default=False)
    minimum_percentage = Column(Float, nullable=True)
    source_document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=True)
    source_reference = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    committee = relationship("Committee", back_populates="requirements")


class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    designation = Column(String(200), nullable=True)
    department = Column(String(200), nullable=True)
    organization = Column(String(300), nullable=True)
    member_type = Column(Enum(MemberType), nullable=False, default=MemberType.FACULTY)
    gender = Column(String(10), nullable=True)
    is_external = Column(Boolean, default=False)
    is_student = Column(Boolean, default=False)
    status = Column(Enum(MemberStatus), nullable=False, default=MemberStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    committee_memberships = relationship("CommitteeMember", back_populates="member")
    attendance_records = relationship("MeetingAttendance", back_populates="member")
    action_items = relationship("ActionItem", back_populates="owner")


class CommitteeMember(Base):
    __tablename__ = "committee_members"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(UUID(as_uuid=False), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(100), nullable=True)  # Chairperson, Convener, Member, etc.
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    appointment_reference = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    committee = relationship("Committee", back_populates="committee_members")
    member = relationship("Member", back_populates="committee_memberships")

    __table_args__ = (
        UniqueConstraint("committee_id", "member_id", name="uq_committee_member"),
    )


class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    authority = Column(String(300), nullable=True)
    version = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    effective_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=True)
    status = Column(Enum(RegulationStatus), nullable=False, default=RegulationStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)
    cloudinary_url = Column(String(1000), nullable=True)
    cloudinary_public_id = Column(String(500), nullable=True)
    category = Column(Enum(DocumentCategory), nullable=False, default=DocumentCategory.OTHER)
    description = Column(Text, nullable=True)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id"), nullable=True, index=True)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id"), nullable=True)
    regulation_id = Column(UUID(as_uuid=False), ForeignKey("regulations.id"), nullable=True)
    uploaded_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    is_indexed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    committee = relationship("Committee", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    meeting_number = Column(String(100), nullable=True)
    meeting_date = Column(Date, nullable=True, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    location = Column(String(500), nullable=True)
    meeting_mode = Column(String(50), nullable=False, default="OFFLINE")  # OFFLINE, ONLINE, HYBRID
    meeting_link = Column(String(500), nullable=True)
    status = Column(Enum(MeetingStatus), nullable=False, default=MeetingStatus.DRAFT)
    agenda_text = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    committee = relationship("Committee", back_populates="meetings")
    created_by_user = relationship("User", back_populates="created_meetings")
    attendance = relationship("MeetingAttendance", back_populates="meeting", cascade="all, delete-orphan")
    quorum_record = relationship("QuorumRecord", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    agendas = relationship("Agenda", back_populates="meeting", cascade="all, delete-orphan")
    minutes = relationship("Minutes", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting")
    documents = relationship("Document", foreign_keys="Document.meeting_id")


class MeetingAttendance(Base):
    __tablename__ = "meeting_attendance"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(UUID(as_uuid=False), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    attendance_status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.ABSENT)
    marked_at = Column(DateTime(timezone=True), server_default=func.now())
    marked_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    remarks = Column(String(500), nullable=True)

    meeting = relationship("Meeting", back_populates="attendance")
    member = relationship("Member", back_populates="attendance_records")

    __table_args__ = (
        UniqueConstraint("meeting_id", "member_id", name="uq_meeting_member_attendance"),
    )


class QuorumRecord(Base):
    __tablename__ = "quorum_records"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    required_count = Column(Integer, nullable=False)
    eligible_count = Column(Integer, nullable=False)
    present_count = Column(Integer, nullable=False)
    quorum_met = Column(Boolean, nullable=False, default=False)
    override_allowed = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    validated_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    meeting = relationship("Meeting", back_populates="quorum_record")


class Agenda(Base):
    __tablename__ = "agendas"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    version = Column(Integer, default=1)
    content = Column(Text, nullable=True)
    generated_by_ai = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    meeting = relationship("Meeting", back_populates="agendas")
    items = relationship("AgendaItem", back_populates="agenda", cascade="all, delete-orphan", order_by="AgendaItem.item_number")


class AgendaItem(Base):
    __tablename__ = "agenda_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    agenda_id = Column(UUID(as_uuid=False), ForeignKey("agendas.id", ondelete="CASCADE"), nullable=False)
    item_number = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(Enum(AgendaSource), nullable=False, default=AgendaSource.MANUAL)
    priority = Column(Enum(ActionPriority), nullable=False, default=ActionPriority.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agenda = relationship("Agenda", back_populates="items")


class Minutes(Base):
    __tablename__ = "minutes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    discussion = Column(Text, nullable=True)
    decisions = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    next_meeting_date = Column(Date, nullable=True)
    status = Column(Enum(MinutesStatus), nullable=False, default=MinutesStatus.DRAFT)
    generated_by_ai = Column(Boolean, default=False)
    approved_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    meeting = relationship("Meeting", back_populates="minutes")
    sections = relationship("MinuteSection", back_populates="minutes", cascade="all, delete-orphan", order_by="MinuteSection.display_order")
    action_items = relationship("ActionItem", back_populates="minute")
    approver = relationship("User", foreign_keys=[approved_by])


class MinuteSection(Base):
    __tablename__ = "minute_sections"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    minutes_id = Column(UUID(as_uuid=False), ForeignKey("minutes.id", ondelete="CASCADE"), nullable=False)
    section_type = Column(Enum(SectionType), nullable=False)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

    minutes = relationship("Minutes", back_populates="sections")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id"), nullable=True, index=True)
    meeting_id = Column(UUID(as_uuid=False), ForeignKey("meetings.id"), nullable=True)
    minute_id = Column(UUID(as_uuid=False), ForeignKey("minutes.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(UUID(as_uuid=False), ForeignKey("members.id"), nullable=True)
    due_date = Column(Date, nullable=True, index=True)
    priority = Column(Enum(ActionPriority), nullable=False, default=ActionPriority.MEDIUM)
    status = Column(Enum(ActionStatus), nullable=False, default=ActionStatus.PENDING, index=True)
    remarks = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    committee = relationship("Committee", back_populates="action_items")
    meeting = relationship("Meeting", back_populates="action_items")
    minute = relationship("Minutes", back_populates="action_items")
    owner = relationship("Member", back_populates="action_items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), default="INFO", nullable=False)  # INFO, SUCCESS, WARNING, CRITICAL
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    entity_type = Column(String(100), nullable=True)  # meeting, committee, action, compliance
    entity_id = Column(UUID(as_uuid=False), nullable=True)
    channel = Column(String(50), default="IN_APP", nullable=False)  # IN_APP, EMAIL, BOTH
    status = Column(String(50), default="UNREAD", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    action = Column(String(200), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(UUID(as_uuid=False), nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")


class UserCommitteeAccess(Base):
    __tablename__ = "user_committee_access"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id", ondelete="CASCADE"), nullable=False)
    access_type = Column(Enum(AccessType), nullable=False, default=AccessType.VIEWER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="committee_access")
    committee = relationship("Committee", back_populates="user_access")

    __table_args__ = (
        UniqueConstraint("user_id", "committee_id", name="uq_user_committee_access"),
    )


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    committee_id = Column(UUID(as_uuid=False), ForeignKey("committees.id", ondelete="CASCADE"), nullable=False)
    checked_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    overall_score = Column(Float, nullable=False, default=0.0)
    status = Column(Enum(ComplianceStatus), nullable=False, default=ComplianceStatus.WARNING)
    composition_score = Column(Float, nullable=True)
    tenure_score = Column(Float, nullable=True)
    meeting_score = Column(Float, nullable=True)
    quorum_score = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())

    committee = relationship("Committee", back_populates="compliance_checks")
    issues = relationship("ComplianceIssue", back_populates="check", cascade="all, delete-orphan")
    checker = relationship("User", foreign_keys=[checked_by])


class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    compliance_check_id = Column(UUID(as_uuid=False), ForeignKey("compliance_checks.id", ondelete="CASCADE"), nullable=False)
    issue_type = Column(Enum(IssueType), nullable=False)
    severity = Column(Enum(IssueSeverity), nullable=False, default=IssueSeverity.MEDIUM)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    check = relationship("ComplianceCheck", back_populates="issues")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    conversation_id = Column(UUID(as_uuid=False), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    tool_used = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("AIConversation", back_populates="messages")


# DocumentChunk uses pgvector — must be added after import
try:
    from pgvector.sqlalchemy import Vector

    class DocumentChunk(Base):
        __tablename__ = "document_chunks"

        id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
        chunk_index = Column(Integer, nullable=False)
        content = Column(Text, nullable=False)
        embedding = Column(Vector(768), nullable=True)
        metadata_ = Column("metadata", JSONB, nullable=True)
        created_at = Column(DateTime(timezone=True), server_default=func.now())

        document = relationship("Document", back_populates="chunks")

except ImportError:
    class DocumentChunk(Base):
        __tablename__ = "document_chunks"

        id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        document_id = Column(UUID(as_uuid=False), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
        chunk_index = Column(Integer, nullable=False)
        content = Column(Text, nullable=False)
        embedding = Column(JSONB, nullable=True)  # Fallback without pgvector
        metadata_ = Column("metadata", JSONB, nullable=True)
        created_at = Column(DateTime(timezone=True), server_default=func.now())

        document = relationship("Document", back_populates="chunks")


# ─── Notification & Automated Email Models ───────────────────────────────────

class NotificationRule(Base):
    __tablename__ = "notification_rules"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    event_type = Column(String(100), nullable=False, unique=True, index=True)
    enabled = Column(Boolean, default=True, nullable=False)
    trigger_config = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())




class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    notification_id = Column(UUID(as_uuid=False), ForeignKey("notifications.id", ondelete="SET NULL"), nullable=True)
    service_name = Column(String(200), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    recipient_email = Column(String(255), nullable=False, index=True)
    cc_emails = Column(String(500), nullable=True)
    subject = Column(String(500), nullable=False)
    template_name = Column(String(100), nullable=False)
    idempotency_key = Column(String(255), nullable=True, unique=True, index=True)
    status = Column(String(50), default="SENT", nullable=False, index=True)  # PENDING, SENDING, SENT, DELIVERED, FAILED, BOUNCED
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    notification = relationship("Notification")
