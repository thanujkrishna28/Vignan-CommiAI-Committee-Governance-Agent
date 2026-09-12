"""
Seed data for Vignan CommiAI.
Creates realistic institutional data with intentional compliance issues for demo.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, init_db
from app.models.models import (
    Base, User, Committee, CommitteeRequirement, Member, CommitteeMember,
    Regulation, Meeting, MeetingAttendance, QuorumRecord, Agenda, AgendaItem,
    Minutes, MinuteSection, ActionItem, AuditLog, UserCommitteeAccess,
    UserRole, UserStatus, CommitteeStatus, MemberType, MemberStatus,
    RequirementType, MeetingStatus, AttendanceStatus, MinutesStatus,
    ActionStatus, ActionPriority, AgendaSource, SectionType,
    AccessType, QuorumType
)
from app.auth.auth import hash_password

def seed():
    from app.database import init_db
    print("Enabling vector extension...")
    init_db()
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return
        
        print("Seeding users...")
        
        # ─── USERS ────────────────────────────────────────────────────────────
        
        registrar = User(
            name="Dr. Rajesh Kumar",
            email="registrar@example.com",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.REGISTRAR,
            status=UserStatus.ACTIVE,
            phone="+91-9876543210"
        )
        
        convener = User(
            name="Prof. Anita Sharma",
            email="convener@example.com",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.CONVENER,
            status=UserStatus.ACTIVE,
            phone="+91-9876543211"
        )
        
        member_user = User(
            name="Dr. Venkat Reddy",
            email="member@example.com",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.MEMBER,
            status=UserStatus.ACTIVE,
            phone="+91-9876543212"
        )
        
        iqac_user = User(
            name="Dr. Priya Nair",
            email="iqac@example.com",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.IQAC,
            status=UserStatus.ACTIVE,
            phone="+91-9876543213"
        )
        
        db.add_all([registrar, convener, member_user, iqac_user])
        db.flush()
        
        print("Seeding committees...")
        
        # ─── COMMITTEES ───────────────────────────────────────────────────────
        
        today = date.today()
        
        ac = Committee(
            name="Academic Council",
            code="AC-001",
            authority="University Grants Commission (UGC)",
            mandate="Oversight of academic programs, curriculum review, examination policies, and academic quality assurance.",
            description="The Academic Council is the apex body for academic affairs of the institution.",
            quorum_type=QuorumType.FIXED,
            quorum_value=8,
            meeting_frequency=2,
            frequency_unit="MONTH",
            status=CommitteeStatus.ACTIVE
        )
        
        fc = Committee(
            name="Finance Committee",
            code="FC-001",
            authority="Ministry of Education",
            mandate="Oversight of institutional finances, budget approval, expenditure review, and financial planning.",
            description="The Finance Committee ensures transparent and accountable financial management.",
            quorum_type=QuorumType.FIXED,
            quorum_value=5,
            meeting_frequency=1,
            frequency_unit="QUARTER",
            status=CommitteeStatus.ACTIVE
        )
        
        ec = Committee(
            name="Examination Committee",
            code="EC-001",
            authority="Board of Examiners",
            mandate="Oversight of examination conduct, results processing, grading policies, and academic integrity.",
            description="The Examination Committee ensures fair and transparent examination processes.",
            quorum_type=QuorumType.FIXED,
            quorum_value=4,
            meeting_frequency=1,
            frequency_unit="MONTH",
            status=CommitteeStatus.ACTIVE
        )
        
        icc = Committee(
            name="Internal Complaints Committee",
            code="ICC-001",
            authority="Sexual Harassment of Women at Workplace (Prevention) Act 2013",
            mandate="Prevention and redressal of sexual harassment complaints at the workplace.",
            description="The ICC is a statutory committee mandated by POSH Act 2013.",
            quorum_type=QuorumType.FIXED,
            quorum_value=3,
            meeting_frequency=1,
            frequency_unit="QUARTER",
            status=CommitteeStatus.ACTIVE
        )
        
        arc_comm = Committee(
            name="Anti-Ragging Committee",
            code="ARC-001",
            authority="UGC Anti-Ragging Regulations 2009",
            mandate="Prevention and prohibition of ragging in educational institutions.",
            description="Statutory committee to ensure ragging-free campus environment.",
            quorum_type=QuorumType.FIXED,
            quorum_value=5,
            meeting_frequency=1,
            frequency_unit="MONTH",
            status=CommitteeStatus.ACTIVE
        )
        
        rac = Committee(
            name="Research Advisory Committee",
            code="RAC-001",
            authority="AICTE Research Policy 2023",
            mandate="Advisory role for research policy, PhD programs, publication standards, and research funding.",
            description="The Research Advisory Committee guides institutional research strategy.",
            quorum_type=QuorumType.FIXED,
            quorum_value=4,
            meeting_frequency=1,
            frequency_unit="QUARTER",
            status=CommitteeStatus.ACTIVE
        )
        
        swc = Committee(
            name="Student Welfare Committee",
            code="SWC-001",
            authority="University Student Charter",
            mandate="Student grievance redressal, welfare activities, scholarships, and student support services.",
            description="Ensures student welfare and holistic development.",
            quorum_type=QuorumType.FIXED,
            quorum_value=4,
            meeting_frequency=1,
            frequency_unit="MONTH",
            status=CommitteeStatus.ACTIVE
        )
        
        lc = Committee(
            name="Library Committee",
            code="LC-001",
            authority="University Library Policy",
            mandate="Library resource acquisition, digital library development, and information services.",
            description="Oversees library operations, resource development, and user services.",
            quorum_type=QuorumType.FIXED,
            quorum_value=3,
            meeting_frequency=1,
            frequency_unit="QUARTER",
            status=CommitteeStatus.ACTIVE
        )
        
        db.add_all([ac, fc, ec, icc, arc_comm, rac, swc, lc])
        db.flush()
        
        print("Seeding committee requirements...")
        
        # ─── REQUIREMENTS ─────────────────────────────────────────────────────
        
        requirements = [
            # Academic Council
            CommitteeRequirement(committee_id=ac.id, requirement_type=RequirementType.COUNT,
                description="Minimum 15 members required", required_count=15),
            CommitteeRequirement(committee_id=ac.id, requirement_type=RequirementType.STUDENT,
                description="At least 2 student representatives required", required_count=2, requires_student=True),
            
            # Finance Committee
            CommitteeRequirement(committee_id=fc.id, requirement_type=RequirementType.COUNT,
                description="Minimum 7 members required", required_count=7),
            CommitteeRequirement(committee_id=fc.id, requirement_type=RequirementType.EXTERNAL,
                description="At least 1 external financial expert required", required_count=1, requires_external=True),
            
            # Examination Committee
            CommitteeRequirement(committee_id=ec.id, requirement_type=RequirementType.COUNT,
                description="Minimum 6 members required", required_count=6),
            
            # Internal Complaints Committee (POSH)
            CommitteeRequirement(committee_id=icc.id, requirement_type=RequirementType.COUNT,
                description="Minimum 4 members required", required_count=4),
            CommitteeRequirement(committee_id=icc.id, requirement_type=RequirementType.EXTERNAL,
                description="1 external NGO/legal expert required by POSH Act", required_count=1, requires_external=True),
            CommitteeRequirement(committee_id=icc.id, requirement_type=RequirementType.GENDER,
                description="Presiding officer must be woman", required_gender="FEMALE", required_count=1),
            
            # Research Advisory Committee (with intentional missing external)
            CommitteeRequirement(committee_id=rac.id, requirement_type=RequirementType.COUNT,
                description="Minimum 6 members required", required_count=6),
            CommitteeRequirement(committee_id=rac.id, requirement_type=RequirementType.EXTERNAL,
                description="At least 2 external research experts from academia/industry required", required_count=2, requires_external=True),
            CommitteeRequirement(committee_id=rac.id, requirement_type=RequirementType.STUDENT,
                description="At least 1 research scholar representative", required_count=1, requires_student=True),
            
            # Student Welfare Committee
            CommitteeRequirement(committee_id=swc.id, requirement_type=RequirementType.COUNT,
                description="Minimum 5 members required", required_count=5),
            CommitteeRequirement(committee_id=swc.id, requirement_type=RequirementType.STUDENT,
                description="At least 2 student representatives required", required_count=2, requires_student=True),
        ]
        db.add_all(requirements)
        db.flush()
        
        print("Seeding members...")
        
        # ─── MEMBERS ──────────────────────────────────────────────────────────
        
        members_data = [
            # Faculty
            Member(name="Dr. Rajesh Kumar", email="rajesh.kumar@vignan.ac.in", designation="Professor & Registrar",
                   department="Administration", member_type=MemberType.ADMINISTRATION, gender="MALE", is_external=False),
            Member(name="Prof. Anita Sharma", email="anita.sharma@vignan.ac.in", designation="Professor & Dean",
                   department="Computer Science", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Dr. Venkat Reddy", email="venkat.reddy@vignan.ac.in", designation="Associate Professor",
                   department="Electronics", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Priya Nair", email="priya.nair@vignan.ac.in", designation="IQAC Director",
                   department="Quality Assurance", member_type=MemberType.ADMINISTRATION, gender="FEMALE", is_external=False),
            Member(name="Prof. Srinivas Rao", email="srinivas.rao@vignan.ac.in", designation="Professor",
                   department="Mechanical Engineering", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Lakshmi Devi", email="lakshmi.devi@vignan.ac.in", designation="Professor",
                   department="Civil Engineering", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Dr. Ravi Shankar", email="ravi.shankar@vignan.ac.in", designation="Associate Professor",
                   department="Mathematics", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Meena Kumari", email="meena.kumari@vignan.ac.in", designation="Associate Professor",
                   department="Physics", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Prof. Arun Kumar", email="arun.kumar@vignan.ac.in", designation="Professor & HoD",
                   department="MBA", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Sunita Patel", email="sunita.patel@vignan.ac.in", designation="Professor",
                   department="Biotechnology", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Dr. Kiran Babu", email="kiran.babu@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Prof. Vijayalakshmi", email="vijaya.laksmi@vignan.ac.in", designation="Professor",
                   department="Chemistry", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Dr. Naresh Babu", email="naresh.babu@vignan.ac.in", designation="Associate Professor",
                   department="Information Technology", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Padmavathi", email="padmavathi@vignan.ac.in", designation="Professor",
                   department="ECE", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Prof. Suresh Chandra", email="suresh.chandra@vignan.ac.in", designation="Dean of Research",
                   department="Research", member_type=MemberType.FACULTY, gender="MALE", is_external=False),
            Member(name="Dr. Ramya Sri", email="ramya.sri@vignan.ac.in", designation="Assistant Professor",
                   department="MBA", member_type=MemberType.FACULTY, gender="FEMALE", is_external=False),
            Member(name="Dr. Chandra Mohan", email="chandra.mohan@vignan.ac.in", designation="Library Director",
                   department="Library", member_type=MemberType.ADMINISTRATION, gender="MALE", is_external=False),
            Member(name="Mrs. Sudha Rani", email="sudha.rani@vignan.ac.in", designation="Finance Controller",
                   department="Finance", member_type=MemberType.ADMINISTRATION, gender="FEMALE", is_external=False),
            Member(name="Dr. Prasad Varma", email="prasad.varma@vignan.ac.in", designation="Controller of Examinations",
                   department="Examinations", member_type=MemberType.ADMINISTRATION, gender="MALE", is_external=False),
            Member(name="Mr. Raju Naidu", email="raju.naidu@vignan.ac.in", designation="Administrative Officer",
                   department="Administration", member_type=MemberType.ADMINISTRATION, gender="MALE", is_external=False),
            
            # External Members
            Member(name="Dr. Krishnamurthy", email="krishnamurthy@iitm.ac.in", designation="Professor",
                   department="Computer Science", organization="IIT Madras",
                   member_type=MemberType.EXTERNAL, gender="MALE", is_external=True),
            Member(name="Adv. Radha Krishnan", email="radha.krishnan@legalaid.org", designation="Senior Advocate",
                   department="Legal", organization="Hyderabad Legal Aid Society",
                   member_type=MemberType.EXTERNAL, gender="MALE", is_external=True),
            Member(name="Ms. Sangeetha Menon", email="sangeetha@ngoforum.org", designation="Director",
                   organization="Women's Rights Forum NGO",
                   member_type=MemberType.EXTERNAL, gender="FEMALE", is_external=True),
            Member(name="Mr. Subramaniam", email="subramaniam@infosys.com", designation="VP Technology",
                   organization="Infosys Limited",
                   member_type=MemberType.EXTERNAL, gender="MALE", is_external=True),
            Member(name="Dr. Padma Reddy", email="padma.reddy@drdo.gov.in", designation="Scientist",
                   organization="DRDO",
                   member_type=MemberType.EXTERNAL, gender="FEMALE", is_external=True),
            
            # Students
            Member(name="Mr. Arjun Rao", email="arjun.rao@student.vignan.ac.in", designation="Student Representative",
                   department="B.Tech CSE", member_type=MemberType.STUDENT, gender="MALE", is_student=True),
            Member(name="Ms. Kavitha Reddy", email="kavitha.reddy@student.vignan.ac.in", designation="Student Representative",
                   department="B.Tech ECE", member_type=MemberType.STUDENT, gender="FEMALE", is_student=True),
            Member(name="Mr. Rahul Gupta", email="rahul.gupta@student.vignan.ac.in", designation="Student Representative",
                   department="MBA", member_type=MemberType.STUDENT, gender="MALE", is_student=True),
            Member(name="Ms. Divya Sharma", email="divya.sharma@student.vignan.ac.in", designation="Research Scholar",
                   department="PhD CS", member_type=MemberType.STUDENT, gender="FEMALE", is_student=True),
            Member(name="Mr. Venkata Suresh", email="venkata.suresh@student.vignan.ac.in", designation="Student Representative",
                   department="B.Tech Civil", member_type=MemberType.STUDENT, gender="MALE", is_student=True),
        ]
        db.add_all(members_data)
        db.flush()
        
        # Build member lookup
        m = {m.name: m for m in members_data}
        
        print("Seeding committee memberships...")
        
        # ─── COMMITTEE MEMBERSHIPS ─────────────────────────────────────────────
        
        # Dates for tenure
        start_2023 = date(2023, 6, 1)
        end_2025 = date(2025, 5, 31)
        start_2024 = date(2024, 1, 1)
        end_2026 = date(2026, 12, 31)
        
        # Finance Committee member with expiring tenure (WARNING scenario)
        end_expiring = today + timedelta(days=18)  # expires in 18 days
        
        # Research Advisory Committee member with tenure expired
        end_expired = today - timedelta(days=5)  # already expired
        
        # Academic Council — COMPLIANT
        ac_members = [
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Rajesh Kumar"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Anita Sharma"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Venkat Reddy"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Srinivas Rao"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Lakshmi Devi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Ravi Shankar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Meena Kumari"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Arun Kumar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Sunita Patel"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Kiran Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Vijayalakshmi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Naresh Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Padmavathi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Suresh Chandra"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Ramya Sri"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Mr. Arjun Rao"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Ms. Kavitha Reddy"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        # Finance Committee — WARNING (member tenure expiring)
        fc_members = [
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. Rajesh Kumar"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Mrs. Sudha Rani"].id, role="Finance Secretary",
                           start_date=start_2024, end_date=end_expiring, is_active=True),  # EXPIRING!
            CommitteeMember(committee_id=fc.id, member_id=m["Prof. Arun Kumar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. Ravi Shankar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Mr. Subramaniam"].id, role="External Expert",
                           start_date=start_2024, end_date=end_2026, is_active=True),  # External present
            CommitteeMember(committee_id=fc.id, member_id=m["Prof. Srinivas Rao"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. Meena Kumari"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
        ]
        
        # Examination Committee — WARNING (overdue meeting)
        ec_members = [
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Prasad Varma"].id, role="Controller/Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Prof. Anita Sharma"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Kiran Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Naresh Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Ramya Sri"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Venkat Reddy"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
        ]
        
        # ICC — COMPLIANT
        icc_members = [
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. Lakshmi Devi"].id, role="Presiding Officer",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Prof. Vijayalakshmi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Ms. Sangeetha Menon"].id, role="External NGO Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),  # External present
            CommitteeMember(committee_id=icc.id, member_id=m["Mrs. Sudha Rani"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. Padmavathi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
        ]
        
        # Research Advisory Committee — NON-COMPLIANT (missing external, missing student, tenure expired)
        rac_members = [
            CommitteeMember(committee_id=rac.id, member_id=m["Prof. Suresh Chandra"].id, role="Chairperson/Dean of Research",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. Sunita Patel"].id, role="Member",
                           start_date=start_2023, end_date=end_expired, is_active=True),  # EXPIRED TENURE!
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. Ravi Shankar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. Meena Kumari"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            # NOTE: No external members (requires 2), no student member (requires 1) — NON-COMPLIANT!
        ]
        
        # Student Welfare Committee — WARNING
        swc_members = [
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. Rajesh Kumar"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. Kiran Babu"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. Ramya Sri"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Mr. Arjun Rao"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Ms. Kavitha Reddy"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Mr. Rahul Gupta"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        # Library Committee — COMPLIANT
        lc_members = [
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. Chandra Mohan"].id, role="Library Director/Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. Naresh Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Prof. Vijayalakshmi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. Ravi Shankar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Mr. Arjun Rao"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        all_memberships = ac_members + fc_members + ec_members + icc_members + rac_members + swc_members + lc_members
        db.add_all(all_memberships)
        db.flush()
        
        print("Seeding meetings...")
        
        # ─── MEETINGS ─────────────────────────────────────────────────────────
        
        # Academic Council — recent meetings (COMPLIANT)
        ac_meeting1 = Meeting(
            committee_id=ac.id, title="Academic Council Meeting - August 2026",
            meeting_number=1, meeting_date=date(2026, 8, 10),
            start_time="10:00", end_time="13:00",
            location="Conference Hall, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        ac_meeting2 = Meeting(
            committee_id=ac.id, title="Academic Council Meeting - September 2026",
            meeting_number=2, meeting_date=today + timedelta(days=7),
            start_time="10:00", end_time="13:00",
            location="Conference Hall, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.SCHEDULED,
            created_by=registrar.id
        )
        
        # Finance Committee — last quarter (WARNING - expiring tenure)
        fc_meeting1 = Meeting(
            committee_id=fc.id, title="Finance Committee Meeting - Q2 2026",
            meeting_number=1, meeting_date=date(2026, 6, 15),
            start_time="11:00", end_time="14:00",
            location="Board Room, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        fc_meeting2 = Meeting(
            committee_id=fc.id, title="Finance Committee Meeting - Q3 2026",
            meeting_number=2, meeting_date=today + timedelta(days=15),
            start_time="11:00", end_time="14:00",
            location="Board Room, Admin Block",
            meeting_mode="HYBRID", status=MeetingStatus.SCHEDULED,
            created_by=registrar.id
        )
        
        # Examination Committee — OVERDUE (last meeting was 45 days ago, frequency=monthly)
        ec_meeting1 = Meeting(
            committee_id=ec.id, title="Examination Committee Meeting - July 2026",
            meeting_number=1, meeting_date=today - timedelta(days=45),
            start_time="09:00", end_time="12:00",
            location="Examination Board Room",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        # RAC — No recent meeting (NON-COMPLIANT)
        rac_meeting1 = Meeting(
            committee_id=rac.id, title="Research Advisory Committee - Q1 2026",
            meeting_number=1, meeting_date=date(2026, 3, 20),
            start_time="10:00", end_time="13:00",
            location="Research Block Conference Room",
            meeting_mode="HYBRID", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        # ICC Meeting
        icc_meeting1 = Meeting(
            committee_id=icc.id, title="ICC Quarterly Meeting - Q2 2026",
            meeting_number=1, meeting_date=date(2026, 7, 5),
            start_time="11:00", end_time="13:00",
            location="Conference Room 2",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        icc_meeting2 = Meeting(
            committee_id=icc.id, title="ICC Quarterly Meeting - Q3 2026",
            meeting_number=2, meeting_date=today + timedelta(days=30),
            start_time="11:00", end_time="13:00",
            location="Conference Room 2",
            meeting_mode="OFFLINE", status=MeetingStatus.SCHEDULED,
            created_by=registrar.id
        )
        
        # SWC
        swc_meeting1 = Meeting(
            committee_id=swc.id, title="Student Welfare Committee - August 2026",
            meeting_number=1, meeting_date=date(2026, 8, 20),
            start_time="14:00", end_time="16:00",
            location="Student Affairs Office",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        swc_meeting2 = Meeting(
            committee_id=swc.id, title="Student Welfare Committee - September 2026",
            meeting_number=2, meeting_date=today + timedelta(days=12),
            start_time="14:00", end_time="16:00",
            location="Student Affairs Office",
            meeting_mode="OFFLINE", status=MeetingStatus.SCHEDULED,
            created_by=registrar.id
        )
        
        all_meetings = [
            ac_meeting1, ac_meeting2, fc_meeting1, fc_meeting2,
            ec_meeting1, rac_meeting1, icc_meeting1, icc_meeting2,
            swc_meeting1, swc_meeting2
        ]
        db.add_all(all_meetings)
        db.flush()
        
        print("Seeding attendance and quorum...")
        
        # ─── ATTENDANCE & QUORUM ──────────────────────────────────────────────
        
        # Academic Council Meeting 1 — quorum met
        ac_attendance = [
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Rajesh Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Anita Sharma"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Venkat Reddy"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Srinivas Rao"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Lakshmi Devi"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Ravi Shankar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Meena Kumari"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Arun Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Sunita Patel"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Kiran Babu"].id, attendance_status=AttendanceStatus.ABSENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Vijayalakshmi"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Naresh Babu"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Padmavathi"].id, attendance_status=AttendanceStatus.EXCUSED),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Suresh Chandra"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Mr. Arjun Rao"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Ms. Kavitha Reddy"].id, attendance_status=AttendanceStatus.PRESENT),
        ]
        db.add_all(ac_attendance)
        
        ac_quorum = QuorumRecord(
            meeting_id=ac_meeting1.id, required_count=8, eligible_count=17,
            present_count=13, quorum_met=True,
            validated_by=registrar.id, validated_at=datetime(2026, 8, 10, 10, 15)
        )
        db.add(ac_quorum)
        
        # Finance Committee Meeting 1 — quorum met
        fc_attendance = [
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. Rajesh Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Mrs. Sudha Rani"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Prof. Arun Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. Ravi Shankar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Mr. Subramaniam"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Prof. Srinivas Rao"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. Meena Kumari"].id, attendance_status=AttendanceStatus.ABSENT),
        ]
        db.add_all(fc_attendance)
        
        fc_quorum = QuorumRecord(
            meeting_id=fc_meeting1.id, required_count=5, eligible_count=7,
            present_count=6, quorum_met=True,
            validated_by=registrar.id, validated_at=datetime(2026, 6, 15, 11, 10)
        )
        db.add(fc_quorum)
        
        db.flush()
        
        print("Seeding action items...")
        
        # ─── ACTION ITEMS ─────────────────────────────────────────────────────
        
        action_items = [
            # Academic Council actions
            ActionItem(
                committee_id=ac.id, meeting_id=ac_meeting1.id,
                title="Finalize new curriculum for B.Tech 2026 batch",
                description="Review and approve the updated curriculum incorporating NEP 2020 guidelines",
                owner_id=m["Prof. Anita Sharma"].id,
                due_date=today + timedelta(days=30),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=ac.id, meeting_id=ac_meeting1.id,
                title="Submit annual academic audit report to UGC",
                description="Prepare and submit comprehensive academic audit documentation",
                owner_id=m["Dr. Rajesh Kumar"].id,
                due_date=today + timedelta(days=45),
                priority=ActionPriority.CRITICAL, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=ac.id, meeting_id=ac_meeting1.id,
                title="Review and update examination regulations",
                description="Update examination regulations to align with NEP 2020",
                owner_id=m["Dr. Prasad Varma"].id,
                due_date=today - timedelta(days=5),  # OVERDUE
                priority=ActionPriority.HIGH, status=ActionStatus.OVERDUE
            ),
            
            # Finance Committee actions
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="Prepare Q3 2026 budget variance report",
                description="Analyze and document budget vs actuals for Q3",
                owner_id=m["Mrs. Sudha Rani"].id,
                due_date=today + timedelta(days=7),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="Process pending faculty salary revisions",
                description="Implement approved salary revision for teaching staff",
                owner_id=m["Mrs. Sudha Rani"].id,
                due_date=today - timedelta(days=10),  # OVERDUE
                priority=ActionPriority.CRITICAL, status=ActionStatus.OVERDUE
            ),
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="Infrastructure development fund allocation",
                description="Allocate approved funds for new laboratory infrastructure",
                owner_id=m["Dr. Rajesh Kumar"].id,
                due_date=today + timedelta(days=60),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # Research Advisory Committee actions
            ActionItem(
                committee_id=rac.id,
                title="Nominate external research expert for RAC",
                description="Identify and nominate 2 external research experts from academia or industry. Required by AICTE Research Policy.",
                owner_id=m["Prof. Suresh Chandra"].id,
                due_date=today + timedelta(days=20),
                priority=ActionPriority.CRITICAL, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=rac.id,
                title="Appoint research scholar representative to RAC",
                description="Nominate a PhD research scholar to serve as student representative on RAC.",
                owner_id=m["Dr. Rajesh Kumar"].id,
                due_date=today + timedelta(days=15),
                priority=ActionPriority.HIGH, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=rac.id, meeting_id=rac_meeting1.id,
                title="Submit research publication policy revision",
                description="Update the research publication policy to include predatory journal list",
                owner_id=m["Prof. Suresh Chandra"].id,
                due_date=today - timedelta(days=15),  # OVERDUE
                priority=ActionPriority.HIGH, status=ActionStatus.OVERDUE
            ),
            
            # Examination Committee actions
            ActionItem(
                committee_id=ec.id, meeting_id=ec_meeting1.id,
                title="Submit revised examination timetable for November 2026",
                description="Finalize and publish the end-semester examination schedule",
                owner_id=m["Dr. Prasad Varma"].id,
                due_date=today + timedelta(days=20),
                priority=ActionPriority.CRITICAL, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=ec.id, meeting_id=ec_meeting1.id,
                title="Digitize all examination records pre-2020",
                description="Scanning and digitization of physical examination records",
                owner_id=m["Dr. Kiran Babu"].id,
                due_date=today + timedelta(days=90),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # ICC actions
            ActionItem(
                committee_id=icc.id,
                title="Conduct POSH awareness training for new faculty",
                description="Mandatory POSH training for all faculty joining this academic year",
                owner_id=m["Dr. Lakshmi Devi"].id,
                due_date=today + timedelta(days=30),
                priority=ActionPriority.HIGH, status=ActionStatus.PENDING
            ),
            
            # SWC actions
            ActionItem(
                committee_id=swc.id, meeting_id=swc_meeting1.id,
                title="Process pending scholarship applications",
                description="Review and approve 45 pending scholarship applications for current semester",
                owner_id=m["Dr. Rajesh Kumar"].id,
                due_date=today + timedelta(days=10),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=swc.id, meeting_id=swc_meeting1.id,
                title="Setup grievance redressal portal",
                description="Implement online portal for student grievance submission and tracking",
                owner_id=m["Dr. Kiran Babu"].id,
                due_date=today + timedelta(days=45),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # Completed actions
            ActionItem(
                committee_id=ac.id,
                title="Submit semester exam results to university",
                description="Upload and submit final semester results",
                owner_id=m["Dr. Prasad Varma"].id,
                due_date=date(2026, 8, 15),
                priority=ActionPriority.CRITICAL, status=ActionStatus.COMPLETED,
                completed_at=datetime(2026, 8, 14, 16, 30)
            ),
            ActionItem(
                committee_id=swc.id,
                title="Organize freshers orientation program",
                description="Plan and execute freshman orientation for 2026 batch",
                owner_id=m["Dr. Ramya Sri"].id,
                due_date=date(2026, 8, 1),
                priority=ActionPriority.HIGH, status=ActionStatus.COMPLETED,
                completed_at=datetime(2026, 7, 31, 18, 0)
            ),
        ]
        db.add_all(action_items)
        
        print("Seeding audit logs...")
        
        # ─── AUDIT LOGS ───────────────────────────────────────────────────────
        
        audit_logs = [
            AuditLog(user_id=registrar.id, action="committee_created", entity_type="committee",
                    description="Academic Council created", created_at=datetime(2026, 1, 10, 9, 0)),
            AuditLog(user_id=registrar.id, action="committee_created", entity_type="committee",
                    description="Finance Committee created", created_at=datetime(2026, 1, 10, 9, 15)),
            AuditLog(user_id=registrar.id, action="member_added", entity_type="committee_member",
                    description="Dr. Rajesh Kumar added as Chairperson to Academic Council", created_at=datetime(2026, 1, 15, 10, 0)),
            AuditLog(user_id=registrar.id, action="meeting_created", entity_type="meeting",
                    description="Academic Council Meeting - August 2026 scheduled", created_at=datetime(2026, 7, 20, 11, 0)),
            AuditLog(user_id=registrar.id, action="attendance_recorded", entity_type="meeting",
                    description="Attendance recorded for Academic Council Meeting - August 2026", created_at=datetime(2026, 8, 10, 10, 30)),
            AuditLog(user_id=registrar.id, action="quorum_validated", entity_type="meeting",
                    description="Quorum MET: 13/8 for Academic Council Meeting", created_at=datetime(2026, 8, 10, 10, 15)),
            AuditLog(user_id=convener.id, action="document_uploaded", entity_type="document",
                    description="Academic Council Meeting Agenda uploaded", created_at=datetime(2026, 8, 5, 14, 0)),
            AuditLog(user_id=registrar.id, action="compliance_checked", entity_type="committee",
                    description="Compliance check run for Research Advisory Committee: NON_COMPLIANT", created_at=datetime(2026, 9, 1, 9, 0)),
        ]
        db.add_all(audit_logs)
        
        # ─── USER COMMITTEE ACCESS ────────────────────────────────────────────
        
        access_records = [
            UserCommitteeAccess(user_id=convener.id, committee_id=ac.id, access_type=AccessType.CONVENER),
            UserCommitteeAccess(user_id=convener.id, committee_id=ec.id, access_type=AccessType.CONVENER),
            UserCommitteeAccess(user_id=member_user.id, committee_id=ac.id, access_type=AccessType.MEMBER),
            UserCommitteeAccess(user_id=member_user.id, committee_id=ec.id, access_type=AccessType.MEMBER),
            UserCommitteeAccess(user_id=member_user.id, committee_id=rac.id, access_type=AccessType.MEMBER),
        ]
        db.add_all(access_records)
        
        db.commit()
        print("\n[SUCCESS] Seed data created successfully!")
        print("\nDemo Accounts:")
        print("  registrar@example.com / Demo@1234  (Registrar - Full Access)")
        print("  convener@example.com / Demo@1234   (Convener - Committee Access)")
        print("  member@example.com / Demo@1234     (Member - Read Access)")
        print("  iqac@example.com / Demo@1234       (IQAC - Compliance Access)")
        print("\nCompliance States:")
        print("  Academic Council: COMPLIANT")
        print("  Finance Committee: WARNING (tenure expiring in 18 days)")
        print("  Examination Committee: WARNING (meeting overdue)")
        print("  Research Advisory Committee: NON-COMPLIANT (missing external members, expired tenure)")
        
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
