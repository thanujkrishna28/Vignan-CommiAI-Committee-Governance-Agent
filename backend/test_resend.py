import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

print("--- Testing Resend Email Service ---")
print(f"API Key: {resend.api_key[:12]}...")

# 1. Test sending to target thanujkrishna22@gmail.com
print("\n1. Testing recipient: thanujkrishna22@gmail.com")
try:
    r1 = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": ["thanujkrishna22@gmail.com"],
        "subject": "Vignan CommiAI — Committee Governance Notification",
        "html": "<p>Vignan CommiAI Test Email to Thanuj Krishna</p>"
    })
    print("SUCCESS sending to thanujkrishna22@gmail.com:", r1)
except Exception as e:
    print("RESEND RESPONSE for thanujkrishna22@gmail.com:", e)

# 2. Test sending to account owner pujithayarramsetty@gmail.com
print("\n2. Testing recipient: pujithayarramsetty@gmail.com (Registered Account Owner)")
try:
    r2 = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": ["pujithayarramsetty@gmail.com"],
        "subject": "Vignan CommiAI — Resend Dispatch Verification",
        "html": "<h3>Vignan CommiAI Notification</h3><p>Resend integration is active and verified!</p>"
    })
    print("SUCCESS sending to pujithayarramsetty@gmail.com:", r2)
except Exception as e:
    print("RESEND RESPONSE for pujithayarramsetty@gmail.com:", e)
