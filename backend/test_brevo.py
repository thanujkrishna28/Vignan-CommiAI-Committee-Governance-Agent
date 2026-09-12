import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.email_service import send_email, send_meeting_notice

print("--- Testing Brevo Email Dispatch ---")
target_email = "thanujkrishna22@gmail.com"
print(f"Sending official test notification to: {target_email}")

try:
    result = send_meeting_notice(
        recipient_emails=[target_email],
        committee_name="Academic Council",
        meeting_title="42nd Regular Session on Curriculum 2026 & NAAC Readiness",
        scheduled_at="Saturday, September 12, 2026 at 10:30 AM IST",
        venue="Senate Hall / Hybrid VC Meeting Room",
        agenda_highlights="1. Ratification of 41st Minutes • 2. AICTE 2026 Model Curriculum Approval • 3. Ph.D. Viva Approvals • 4. NAAC SSR Metric 6.5 Review"
    )
    print("\nSUCCESS! Email dispatched via Brevo:")
    print("Response Status:", result.get("status"))
    print("Message ID:", result.get("message_id"))
    print("Full Response:", result.get("data"))
except Exception as e:
    print("\nFAILED:", e)
