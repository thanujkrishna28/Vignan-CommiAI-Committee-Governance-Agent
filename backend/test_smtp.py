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
receiver_email = "thanujkrishna22@gmail.com"

msg = MIMEMultipart("alternative")
msg["Subject"] = "Official Statutory Meeting Notice — Academic Council Session 42 | Vignan CommiAI"
msg["From"] = f"{sender_name} <{sender_email}>"
msg["To"] = receiver_email

html = """
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #0A2540; padding: 25px 30px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Vignan CommiAI — Official Statutory Notice</h2>
            <p style="color: #E8B943; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Office of the Registrar</p>
        </div>
        <div style="padding: 30px; color: #334155; line-height: 1.6; font-size: 15px;">
            <p>Dear Committee Member,</p>
            <p>You are hereby notified to attend the upcoming statutory session convened under the authority of the University Charter:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Committee:</strong> Academic Council</p>
                <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Session:</strong> 42nd Regular Session</p>
                <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Scheduled Date:</strong> Saturday, September 12, 2026 at 10:30 AM IST</p>
                <p style="margin: 0; color: #0f172a;"><strong>Venue:</strong> Senate Hall / Hybrid VC Video Room</p>
            </div>
            <p><strong>Agenda Highlights:</strong><br>
            1. Ratification of 41st Minutes<br>
            2. AICTE 2026 Model Curriculum Revision for B.Tech CSE & ECE<br>
            3. Ph.D. Viva-Voce Degree Approvals (14 scholars)<br>
            4. NAAC Criterion 6 SSR Governance Filing
            </p>
            <p style="margin-top: 20px;">Your attendance is vital to attain legal statutory quorum. Please log in to the CommiAI portal to confirm your attendance.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
            Vignan's Foundation for Science, Technology & Research (Deemed to be University)<br>
            Automated notification dispatched via Vignan CommiAI Governance Agent.
        </div>
    </div>
</div>
"""

msg.attach(MIMEText(html, "html"))

print(f"Connecting to {smtp_server}:{port}...")
try:
    server = smtplib.SMTP(smtp_server, port, timeout=25)
    server.starttls()
    print("TLS handshake complete. Authenticating with Brevo SMTP...")
    server.login(login, password)
    print("SMTP Authentication SUCCESSFUL!")
    print(f"Sending email from {sender_email} to {receiver_email}...")
    server.sendmail(sender_email, [receiver_email], msg.as_string())
    server.quit()
    print("\n[SUCCESS] EMAIL HAS BEEN SENT AND DELIVERED TO", receiver_email)
except Exception as e:
    print("\nSMTP ERROR:", e)
