"""
Seed data for Vignan CommiAI.
Creates realistic institutional data with authentic VFSTR faculty members and intentional compliance states for demo.
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

def seed(force: bool = False):
    from app.database import init_db
    print("Enabling vector extension...")
    init_db()
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded and not force
        if not force and db.query(User).count() > 0:
            print("Database already seeded. Skipping (use --force to reseed).")
            return
        
        if force:
            print("Force flag detected. Clearing existing data...")
            # Truncate / delete existing data in correct FK dependency order
            db.query(AuditLog).delete()
            db.query(ActionItem).delete()
            db.query(MinuteSection).delete()
            db.query(Minutes).delete()
            db.query(AgendaItem).delete()
            db.query(Agenda).delete()
            db.query(QuorumRecord).delete()
            db.query(MeetingAttendance).delete()
            db.query(Meeting).delete()
            db.query(UserCommitteeAccess).delete()
            db.query(CommitteeMember).delete()
            db.query(CommitteeRequirement).delete()
            db.query(Member).delete()
            db.query(Committee).delete()
            db.query(User).delete()
            db.commit()
            print("Existing tables cleared.")
        
        print("Seeding users...")
        
        # ─── USERS ────────────────────────────────────────────────────────────
        
        registrar = User(
            name="Prof. Dr. K. V. Krishna Kishore",
            email="kvkk_cse@vignan.ac.in",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.REGISTRAR,
            status=UserStatus.ACTIVE,
            phone="+91-9440856976"
        )
        
        convener = User(
            name="Dr. S. V. Phani Kumar",
            email="dsvpk_cse@vignan.ac.in",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.CONVENER,
            status=UserStatus.ACTIVE,
            phone="+91-9912354004"
        )
        
        member_user = User(
            name="Dr. J. Veeranjaneyulu",
            email="jv_cse@vignan.ac.in",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.MEMBER,
            status=UserStatus.ACTIVE,
            phone="+91-9032128228"
        )
        
        iqac_user = User(
            name="Dr. E. Deepak Chowdary",
            email="edc_cse@vignan.ac.in",
            password_hash=hash_password("Demo@1234"),
            role=UserRole.IQAC,
            status=UserStatus.ACTIVE,
            phone="+91-9553147457"
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
            
            # Research Advisory Committee (with intentional missing external for demo)
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
        
        print("Seeding real VFSTR CSE faculty members directory...")
        
        # ─── REAL FACULTY & STATUTORY MEMBERS ──────────────────────────────────
        
        members_data = [
            # Real VFSTR CSE Department Faculty
            Member(name="Prof. Dr. K. V. Krishna Kishore", email="kvkk_cse@vignan.ac.in", designation="Professor & Dean, SOCE",
                   department="Computer Science & Engineering", member_type=MemberType.ADMINISTRATION, gender="MALE", phone="+91-9440856976", is_external=False),
            Member(name="Dr. S. V. Phani Kumar", email="dsvpk_cse@vignan.ac.in", designation="Professor & HoD, CSE",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9912354004", is_external=False),
            Member(name="Dr. N. Veeranjaneyulu", email="drnv_cse@vignan.ac.in", designation="Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9885230292", is_external=False),
            Member(name="Dr. P. Siva Prasad", email="drpsp_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9000543303", is_external=False),
            Member(name="Dr. S. Deva Kumar", email="sdc_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9959589221", is_external=False),
            Member(name="Dr. B. Yalamanda", email="by_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9912382838", is_external=False),
            Member(name="Dr. D. V. S. S. Subrahmanyam", email="drdvs_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9848383849", is_external=False),
            Member(name="Dr. D. Sreenu", email="drds_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-7981711146", is_external=False),
            Member(name="Dr. Shaik Shafi", email="ss_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-8919630537", is_external=False),
            Member(name="Dr. R. Prahlad Kumar", email="rpk_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-7569202591", is_external=False),
            Member(name="Dr. Satish Kumar Setti", email="sks_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9501236143", is_external=False),
            Member(name="Dr. M. Sunil Babu", email="msb_cse@vignan.ac.in", designation="Associate Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9346210440", is_external=False),
            Member(name="Dr. E. Deepak Chowdary", email="edc_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9553147457", is_external=False),
            Member(name="Dr. Ch. V. Krishna Reddy", email="drckr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9492160912", is_external=False),
            Member(name="Dr. S. S. S. N. Usha Devi N.", email="sssnud_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9849931362", is_external=False),
            Member(name="Dr. T. M. Nagesh", email="tmn_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9989063538", is_external=False),
            Member(name="Mr. Md. Ghouse Mohiddin", email="mgm_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9490243406", is_external=False),
            Member(name="Dr. Vinuj T", email="drvt_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9751888957", is_external=False),
            Member(name="Dr. B. Venugopal", email="drbvg_cse@vignan.ac.in", designation="Sr. Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9346247171", is_external=False),
            Member(name="Dr. G. Sasibhushana Rao", email="drgsbr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9553106888", is_external=False),
            Member(name="Dr. U. Bhaskar", email="drub_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9949700992", is_external=False),
            Member(name="Dr. K. Ravindra Swaroop", email="krs_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9963628004", is_external=False),
            Member(name="Dr. G. Bala Narsimha Rao", email="gbnr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9912754608", is_external=False),
            Member(name="Dr. G. Venkatasubba Reddy", email="drgvsr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9177973607", is_external=False),
            Member(name="Dr. J. Veeranjaneyulu", email="jv_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9032128228", is_external=False),
            Member(name="Dr. Krishna Kanth", email="bkr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9492729993", is_external=False),
            Member(name="Dr. J. Vijetha Ananthi", email="jva_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9704528946", is_external=False),
            Member(name="Dr. P. Samatha Rao", email="p_samatharao_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9493202740", is_external=False),
            Member(name="Dr. M. Teja Sree", email="tsm_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9849310847", is_external=False),
            Member(name="Dr. Janardhan Karuturi", email="jk_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9908762922", is_external=False),
            Member(name="Dr. V. Vijaya Bhaskara Rao", email="vvr_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9440621300", is_external=False),
            Member(name="Dr. Bukke Radha Keerthi", email="drbrk_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9881185411", is_external=False),
            Member(name="Dr. M. Bhargavi", email="mb_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-7981121100", is_external=False),
            Member(name="Dr. Shyam Sunder Nethi", email="ngss_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-7032524716", is_external=False),
            Member(name="Dr. G. Sreeram", email="gs_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9985958567", is_external=False),
            Member(name="Mrs. M. Sirisha", email="ms_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-8978586926", is_external=False),
            Member(name="Dr. B. Premamayudu", email="bpm_cse@vignan.ac.in", designation="Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9440552433", is_external=False),
            Member(name="Dr. S. Venkateswarlu", email="sv_cse@vignan.ac.in", designation="Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="MALE", phone="+91-9848143232", is_external=False),
            Member(name="Mrs. K. Prasanthi", email="kp_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9849201928", is_external=False),
            Member(name="Mrs. P. Vijaya Bala", email="pvb_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9866839399", is_external=False),
            Member(name="Mrs. Ch. Pavani", email="chp_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9704153071", is_external=False),
            Member(name="Mrs. K. Himabindu", email="khb_cse@vignan.ac.in", designation="Assistant Professor",
                   department="Computer Science & Engineering", member_type=MemberType.FACULTY, gender="FEMALE", phone="+91-9949987822", is_external=False),
            
            # External Statutory & Domain Experts
            Member(name="Adv. T. Raghavan", email="raghavan.legal@hckerala.gov.in", designation="Senior Advocate & Legal Advisor",
                   department="Legal & Statutory", organization="High Court Advocates Council",
                   member_type=MemberType.EXTERNAL, gender="MALE", phone="+91-9847012345", is_external=True),
            Member(name="Dr. M. S. Ramachandra", email="msr@iitm.ac.in", designation="Professor & Research Advisor",
                   department="Computer Science", organization="IIT Madras",
                   member_type=MemberType.EXTERNAL, gender="MALE", phone="+91-9444011223", is_external=True),
            Member(name="Ms. Lakshmi Prasanna", email="lakshmi.p@welfarengo.org", designation="Director",
                   department="Social Welfare", organization="Women & Child Welfare Society NGO",
                   member_type=MemberType.EXTERNAL, gender="FEMALE", phone="+91-9848099887", is_external=True),
            Member(name="Mr. N. S. Ramanathan", email="ramanathan.ns@tcs.com", designation="VP Technology",
                   department="Industry Collaborations", organization="Tata Consultancy Services",
                   member_type=MemberType.EXTERNAL, gender="MALE", phone="+91-9820055443", is_external=True),
            Member(name="Dr. A. Sanjeeva Rao", email="sanjeeva.rao@drdo.gov.in", designation="Senior Scientist",
                   department="Defense R&D", organization="DRDO",
                   member_type=MemberType.EXTERNAL, gender="MALE", phone="+91-9440188776", is_external=True),
            
            # Student Representatives
            Member(name="Mr. K. Arjun Varma", email="211fa04001@vignan.ac.in", designation="Student Representative",
                   department="B.Tech CSE", member_type=MemberType.STUDENT, gender="MALE", phone="+91-9121040001", is_student=True),
            Member(name="Ms. P. Sai Harika", email="211fa04045@vignan.ac.in", designation="Student Representative",
                   department="B.Tech CSE", member_type=MemberType.STUDENT, gender="FEMALE", phone="+91-9121040045", is_student=True),
            Member(name="Mr. Ch. Tarun Kumar", email="221fa04012@vignan.ac.in", designation="Student Representative",
                   department="B.Tech CSE", member_type=MemberType.STUDENT, gender="MALE", phone="+91-9121040012", is_student=True),
            Member(name="Ms. V. Divya Teja", email="201fa04022@vignan.ac.in", designation="Research Scholar",
                   department="PhD Computer Science", member_type=MemberType.STUDENT, gender="FEMALE", phone="+91-9121040022", is_student=True),
        ]
        db.add_all(members_data)
        db.flush()
        
        # Build member lookup
        m = {mem.name: mem for mem in members_data}
        
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
        
        # Academic Council — COMPLIANT (apex body)
        ac_members = [
            CommitteeMember(committee_id=ac.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. S. V. Phani Kumar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. N. Veeranjaneyulu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. P. Siva Prasad"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. S. Deva Kumar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. B. Yalamanda"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. D. V. S. S. Subrahmanyam"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. D. Sreenu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Shaik Shafi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. R. Prahlad Kumar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. Satish Kumar Setti"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. M. Sunil Babu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. E. Deepak Chowdary"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. J. Veeranjaneyulu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. S. S. S. N. Usha Devi N."].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. J. Vijetha Ananthi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Dr. M. Bhargavi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Mr. K. Arjun Varma"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=ac.id, member_id=m["Ms. P. Sai Harika"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        # Finance Committee — WARNING (member tenure expiring in 18 days)
        fc_members = [
            CommitteeMember(committee_id=fc.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. S. V. Phani Kumar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. P. Siva Prasad"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. B. Yalamanda"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. R. Prahlad Kumar"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=fc.id, member_id=m["Dr. J. Vijetha Ananthi"].id, role="Finance Secretary",
                           start_date=start_2024, end_date=end_expiring, is_active=True),  # EXPIRING!
            CommitteeMember(committee_id=fc.id, member_id=m["Mr. N. S. Ramanathan"].id, role="External Expert",
                           start_date=start_2024, end_date=end_2026, is_active=True),  # External present
        ]
        
        # Examination Committee — WARNING (meeting overdue)
        ec_members = [
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. N. Veeranjaneyulu"].id, role="Controller/Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. S. V. Phani Kumar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. D. V. S. S. Subrahmanyam"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. Satish Kumar Setti"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. E. Deepak Chowdary"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=ec.id, member_id=m["Dr. J. Veeranjaneyulu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
        ]
        
        # Internal Complaints Committee (POSH) — COMPLIANT
        icc_members = [
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. S. S. S. N. Usha Devi N."].id, role="Presiding Officer",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. J. Vijetha Ananthi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. Bukke Radha Keerthi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Dr. M. Bhargavi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Mrs. M. Sirisha"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=icc.id, member_id=m["Ms. Lakshmi Prasanna"].id, role="External NGO Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),  # External present
        ]
        
        # Research Advisory Committee — NON-COMPLIANT (missing external, missing student, tenure expired)
        rac_members = [
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. B. Premamayudu"].id, role="Chairperson/Dean of Research",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. S. Deva Kumar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. Shaik Shafi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=rac.id, member_id=m["Dr. Vinuj T"].id, role="Member",
                           start_date=start_2023, end_date=end_expired, is_active=True),  # EXPIRED TENURE!
            # Intentional Demo Gap: No external members (requires 2), no student member (requires 1)
        ]
        
        # Student Welfare Committee — WARNING
        swc_members = [
            CommitteeMember(committee_id=swc.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. J. Veeranjaneyulu"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. E. Deepak Chowdary"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Dr. P. Samatha Rao"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Mr. K. Arjun Varma"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Ms. P. Sai Harika"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
            CommitteeMember(committee_id=swc.id, member_id=m["Mr. Ch. Tarun Kumar"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        # Library Committee — COMPLIANT
        lc_members = [
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. S. Venkateswarlu"].id, role="Library Committee Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. M. Sunil Babu"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. G. Sasibhushana Rao"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. Janardhan Karuturi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Dr. Shyam Sunder Nethi"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=lc.id, member_id=m["Mr. K. Arjun Varma"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        # Anti-Ragging Committee — COMPLIANT
        arc_members = [
            CommitteeMember(committee_id=arc_comm.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, role="Chairperson",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=arc_comm.id, member_id=m["Dr. S. V. Phani Kumar"].id, role="Convener",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=arc_comm.id, member_id=m["Dr. N. Veeranjaneyulu"].id, role="Member",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=arc_comm.id, member_id=m["Adv. T. Raghavan"].id, role="Legal Advisor",
                           start_date=start_2024, end_date=end_2026, is_active=True),
            CommitteeMember(committee_id=arc_comm.id, member_id=m["Mr. K. Arjun Varma"].id, role="Student Representative",
                           start_date=start_2024, end_date=date(2025, 5, 31), is_active=True),
        ]
        
        all_memberships = ac_members + fc_members + ec_members + icc_members + rac_members + swc_members + lc_members + arc_members
        db.add_all(all_memberships)
        db.flush()
        
        print("Seeding meetings...")
        
        # ─── MEETINGS ─────────────────────────────────────────────────────────
        
        # Academic Council — recent meetings (COMPLIANT)
        ac_meeting1 = Meeting(
            committee_id=ac.id, title="Academic Council Meeting - August 2026",
            meeting_number=1, meeting_date=date(2026, 8, 10),
            start_time="10:00", end_time="13:00",
            location="Board Room, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        ac_meeting2 = Meeting(
            committee_id=ac.id, title="Academic Council Meeting - September 2026",
            meeting_number=2, meeting_date=today + timedelta(days=7),
            start_time="10:00", end_time="13:00",
            location="Board Room, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.SCHEDULED,
            created_by=registrar.id
        )
        
        # Finance Committee — last quarter (WARNING - expiring tenure)
        fc_meeting1 = Meeting(
            committee_id=fc.id, title="Finance Committee Meeting - Q2 2026",
            meeting_number=1, meeting_date=date(2026, 6, 15),
            start_time="11:00", end_time="14:00",
            location="Conference Hall 1, Admin Block",
            meeting_mode="OFFLINE", status=MeetingStatus.COMPLETED,
            created_by=registrar.id
        )
        
        fc_meeting2 = Meeting(
            committee_id=fc.id, title="Finance Committee Meeting - Q3 2026",
            meeting_number=2, meeting_date=today + timedelta(days=15),
            start_time="11:00", end_time="14:00",
            location="Conference Hall 1, Admin Block",
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
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. S. V. Phani Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. N. Veeranjaneyulu"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. P. Siva Prasad"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. S. Deva Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. B. Yalamanda"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. D. V. S. S. Subrahmanyam"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. D. Sreenu"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Shaik Shafi"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. R. Prahlad Kumar"].id, attendance_status=AttendanceStatus.ABSENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. Satish Kumar Setti"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. M. Sunil Babu"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. E. Deepak Chowdary"].id, attendance_status=AttendanceStatus.EXCUSED),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Dr. J. Veeranjaneyulu"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Mr. K. Arjun Varma"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=ac_meeting1.id, member_id=m["Ms. P. Sai Harika"].id, attendance_status=AttendanceStatus.PRESENT),
        ]
        db.add_all(ac_attendance)
        
        ac_quorum = QuorumRecord(
            meeting_id=ac_meeting1.id, required_count=8, eligible_count=19,
            present_count=14, quorum_met=True,
            validated_by=registrar.id, validated_at=datetime(2026, 8, 10, 10, 15)
        )
        db.add(ac_quorum)
        
        # Finance Committee Meeting 1 — quorum met
        fc_attendance = [
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Prof. Dr. K. V. Krishna Kishore"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. S. V. Phani Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. P. Siva Prasad"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. B. Yalamanda"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. R. Prahlad Kumar"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Dr. J. Vijetha Ananthi"].id, attendance_status=AttendanceStatus.PRESENT),
            MeetingAttendance(meeting_id=fc_meeting1.id, member_id=m["Mr. N. S. Ramanathan"].id, attendance_status=AttendanceStatus.PRESENT),
        ]
        db.add_all(fc_attendance)
        
        fc_quorum = QuorumRecord(
            meeting_id=fc_meeting1.id, required_count=5, eligible_count=7,
            present_count=7, quorum_met=True,
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
                title="Finalize new curriculum for B.Tech CSE 2026 batch",
                description="Review and approve the updated AI & Data Science specializations incorporating NEP 2020 guidelines",
                owner_id=m["Dr. S. V. Phani Kumar"].id,
                due_date=today + timedelta(days=30),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=ac.id, meeting_id=ac_meeting1.id,
                title="Submit annual academic audit report to UGC",
                description="Prepare and submit comprehensive institutional academic audit documentation",
                owner_id=m["Prof. Dr. K. V. Krishna Kishore"].id,
                due_date=today + timedelta(days=45),
                priority=ActionPriority.CRITICAL, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=ac.id, meeting_id=ac_meeting1.id,
                title="Review and update autonomous examination regulations",
                description="Update examination continuous assessment policies to align with NBA outcome-based criteria",
                owner_id=m["Dr. N. Veeranjaneyulu"].id,
                due_date=today - timedelta(days=5),  # OVERDUE
                priority=ActionPriority.HIGH, status=ActionStatus.OVERDUE
            ),
            
            # Finance Committee actions
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="Prepare Q3 2026 CSE department lab variance report",
                description="Analyze and document AI supercomputing lab equipment budget vs actual expenditure",
                owner_id=m["Dr. J. Vijetha Ananthi"].id,
                due_date=today + timedelta(days=7),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="Process faculty research incentive disbursements",
                description="Implement approved faculty Scopus/SCI publication incentive payments",
                owner_id=m["Dr. J. Vijetha Ananthi"].id,
                due_date=today - timedelta(days=10),  # OVERDUE
                priority=ActionPriority.CRITICAL, status=ActionStatus.OVERDUE
            ),
            ActionItem(
                committee_id=fc.id, meeting_id=fc_meeting1.id,
                title="High performance GPU server cluster fund allocation",
                description="Allocate approved institutional capital funds for generative AI research servers",
                owner_id=m["Prof. Dr. K. V. Krishna Kishore"].id,
                due_date=today + timedelta(days=60),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # Research Advisory Committee actions
            ActionItem(
                committee_id=rac.id,
                title="Nominate external research experts for RAC",
                description="Identify and nominate 2 external research experts from IIT/IISc or top R&D organizations. Required by AICTE Research Policy.",
                owner_id=m["Dr. B. Premamayudu"].id,
                due_date=today + timedelta(days=20),
                priority=ActionPriority.CRITICAL, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=rac.id,
                title="Appoint research scholar representative to RAC",
                description="Nominate a PhD research scholar to serve as statutory student representative on RAC.",
                owner_id=m["Prof. Dr. K. V. Krishna Kishore"].id,
                due_date=today + timedelta(days=15),
                priority=ActionPriority.HIGH, status=ActionStatus.PENDING
            ),
            ActionItem(
                committee_id=rac.id, meeting_id=rac_meeting1.id,
                title="Submit revised faculty journal publication guidelines",
                description="Update university research publication criteria to exclude predatory indexing and reward Q1/Q2 journals",
                owner_id=m["Dr. B. Premamayudu"].id,
                due_date=today - timedelta(days=15),  # OVERDUE
                priority=ActionPriority.HIGH, status=ActionStatus.OVERDUE
            ),
            
            # Examination Committee actions
            ActionItem(
                committee_id=ec.id, meeting_id=ec_meeting1.id,
                title="Submit end-semester examination timetable for November 2026",
                description="Finalize and publish the institutional end-semester examination schedule and squad rosters",
                owner_id=m["Dr. N. Veeranjaneyulu"].id,
                due_date=today + timedelta(days=20),
                priority=ActionPriority.CRITICAL, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=ec.id, meeting_id=ec_meeting1.id,
                title="Digitize valuation records and question bank archives",
                description="Complete digital encryption of university question paper repository",
                owner_id=m["Dr. Satish Kumar Setti"].id,
                due_date=today + timedelta(days=90),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # ICC actions
            ActionItem(
                committee_id=icc.id,
                title="Conduct POSH statutory awareness workshop for new batch",
                description="Mandatory POSH induction session for all newly admitted students and staff",
                owner_id=m["Dr. S. S. S. N. Usha Devi N."].id,
                due_date=today + timedelta(days=30),
                priority=ActionPriority.HIGH, status=ActionStatus.PENDING
            ),
            
            # SWC actions
            ActionItem(
                committee_id=swc.id, meeting_id=swc_meeting1.id,
                title="Process merit-cum-means scholarship applications",
                description="Review and sanction 45 pending merit scholarship disbursements for the semester",
                owner_id=m["Prof. Dr. K. V. Krishna Kishore"].id,
                due_date=today + timedelta(days=10),
                priority=ActionPriority.HIGH, status=ActionStatus.IN_PROGRESS
            ),
            ActionItem(
                committee_id=swc.id, meeting_id=swc_meeting1.id,
                title="Setup automated student grievance tracking system",
                description="Integrate online portal for confidential grievance logging and SLA dispatch",
                owner_id=m["Dr. J. Veeranjaneyulu"].id,
                due_date=today + timedelta(days=45),
                priority=ActionPriority.MEDIUM, status=ActionStatus.PENDING
            ),
            
            # Completed actions
            ActionItem(
                committee_id=ac.id,
                title="Submit semester results and grade cards to University Portal",
                description="Publish semester grade points and issue digital transcripts",
                owner_id=m["Dr. N. Veeranjaneyulu"].id,
                due_date=date(2026, 8, 15),
                priority=ActionPriority.CRITICAL, status=ActionStatus.COMPLETED,
                completed_at=datetime(2026, 8, 14, 16, 30)
            ),
            ActionItem(
                committee_id=swc.id,
                title="Organize University Mahotsav 2026 technical symposium",
                description="Conducted department hackathon and inter-college coding festival",
                owner_id=m["Dr. E. Deepak Chowdary"].id,
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
                    description="Academic Council established with UGC compliance charter", created_at=datetime(2026, 1, 10, 9, 0)),
            AuditLog(user_id=registrar.id, action="committee_created", entity_type="committee",
                    description="Finance Committee constituted", created_at=datetime(2026, 1, 10, 9, 15)),
            AuditLog(user_id=registrar.id, action="member_added", entity_type="committee_member",
                    description="Prof. Dr. K. V. Krishna Kishore appointed as Chairperson to Academic Council", created_at=datetime(2026, 1, 15, 10, 0)),
            AuditLog(user_id=registrar.id, action="meeting_created", entity_type="meeting",
                    description="Academic Council Meeting - August 2026 scheduled", created_at=datetime(2026, 7, 20, 11, 0)),
            AuditLog(user_id=registrar.id, action="attendance_recorded", entity_type="meeting",
                    description="Attendance recorded for Academic Council Meeting - August 2026", created_at=datetime(2026, 8, 10, 10, 30)),
            AuditLog(user_id=registrar.id, action="quorum_validated", entity_type="meeting",
                    description="Quorum MET: 14/8 for Academic Council Meeting", created_at=datetime(2026, 8, 10, 10, 15)),
            AuditLog(user_id=convener.id, action="document_uploaded", entity_type="document",
                    description="Academic Council Meeting Agenda & Notice circulated", created_at=datetime(2026, 8, 5, 14, 0)),
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
            UserCommitteeAccess(user_id=member_user.id, committee_id=swc.id, access_type=AccessType.MEMBER),
            UserCommitteeAccess(user_id=member_user.id, committee_id=rac.id, access_type=AccessType.MEMBER),
        ]
        db.add_all(access_records)
        
        db.commit()
        print("\n[SUCCESS] Authentic VFSTR Faculty & Committee Member data seeded successfully!")
        print("\nDemo Accounts:")
        print("  kvkk_cse@vignan.ac.in / Demo@1234  (Registrar - Prof. Dr. K. V. Krishna Kishore)")
        print("  dsvpk_cse@vignan.ac.in / Demo@1234 (Convener - Dr. S. V. Phani Kumar)")
        print("  jv_cse@vignan.ac.in / Demo@1234    (Member - Dr. J. Veeranjaneyulu)")
        print("  edc_cse@vignan.ac.in / Demo@1234   (IQAC - Dr. E. Deepak Chowdary)")
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
    force_flag = "--force" in sys.argv
    seed(force=force_flag)
