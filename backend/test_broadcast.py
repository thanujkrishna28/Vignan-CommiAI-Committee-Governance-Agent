import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import os

smtp_server = os.environ.get("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
port = int(os.environ.get("BREVO_SMTP_PORT", 587))
login = os.environ.get("BREVO_SMTP_LOGIN", "smtp-login-placeholder")
password = os.environ.get("BREVO_SMTP_KEY", "smtp-key-placeholder")

sender_email = "thanujkrishna22@gmail.com"
sender_name = "Vignan University"
recipients = ["thanujkrishna22@gmail.com", "pujithayarramsetty@gmail.com"]

msg = MIMEMultipart("alternative")
msg["Subject"] = "Broadcast Test: Statutory Meeting Quorum Notice | Vignan CommiAI"
msg["From"] = f"{sender_name} <{sender_email}>"
msg["To"] = ", ".join(recipients)

html = """
<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A2540; margin-top: 0;">Vignan CommiAI — Broadcast Verification</h2>
        <p style="color: #334155;">This email confirms that the multi-recipient transactional email engine is active and operational for both Development & Production.</p>
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 12px 16px; border-radius: 6px; color: #065F46; font-weight: bold;">
            Status: Active & Verified on Brevo SMTP Relay
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Vignan's Foundation for Science, Technology & Research</p>
    </div>
</div>
"""
msg.attach(MIMEText(html, "html"))

print(f"Sending broadcast to {len(recipients)} recipients: {recipients}")
with smtplib.SMTP(smtp_server, port, timeout=20) as server:
    server.starttls()
    server.login(login, password)
    server.sendmail(sender_email, recipients, msg.as_string())
print("[SUCCESS] Multi-recipient email delivered successfully to all!")
