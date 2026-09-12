"""
Institutional Email Dispatch Service using Brevo SMTP and REST API.
Supports multi-recipient meeting notices, quorum alerts, minutes circulars, and action item reminders.
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import httpx
import logging
from typing import List, Optional, Union
from app.config import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email_smtp(
    recipients: Union[str, List[str]],
    subject: str,
    html_content: str,
    sender_name: Optional[str] = None,
    sender_email: Optional[str] = None,
) -> dict:
    """Sends email via Brevo standard SMTP relay."""
    if isinstance(recipients, str):
        recipient_list = [recipients.strip()]
    else:
        recipient_list = [r.strip() for r in recipients if r.strip()]

    from_email = sender_email or settings.EMAIL_FROM or "pujithayarramsetty@gmail.com"
    from_name = sender_name or settings.EMAIL_FROM_NAME or "Vignan CommiAI"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = ", ".join(recipient_list)
    msg.attach(MIMEText(html_content, "html"))

    server_host = settings.BREVO_SMTP_SERVER
    server_port = settings.BREVO_SMTP_PORT
    login = settings.BREVO_SMTP_LOGIN
    password = settings.BREVO_SMTP_KEY or settings.BREVO_API_KEY

    try:
        with smtplib.SMTP(server_host, server_port, timeout=3) as server:
            server.starttls()
            server.login(login, password)
            server.sendmail(from_email, recipient_list, msg.as_string())
        return {"status": "success", "recipients": recipient_list}
    except Exception as smtp_err:
        logger.warning(f"SMTP dispatch failed: {smtp_err}")
        raise smtp_err


def send_email_api(
    recipients: Union[str, List[str]],
    subject: str,
    html_content: str,
    sender_name: Optional[str] = None,
    sender_email: Optional[str] = None,
) -> dict:
    """Sends transactional email via Brevo REST API."""
    api_key = settings.BREVO_API_KEY
    if not api_key:
        raise ValueError("Brevo API key is not configured")

    if isinstance(recipients, str):
        recipient_list = [{"email": recipients.strip()}]
    else:
        recipient_list = [{"email": r.strip()} for r in recipients if r.strip()]

    from_email = sender_email or settings.EMAIL_FROM or "thanujkrishna22@gmail.com"
    from_name = sender_name or settings.EMAIL_FROM_NAME or "Vignan CommiAI"

    payload = {
        "sender": {"name": from_name, "email": from_email},
        "to": recipient_list,
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    with httpx.Client(timeout=5.0) as client:
        response = client.post(BREVO_API_URL, json=payload, headers=headers)
        if response.status_code in [200, 201, 202]:
            return {"status": "success", "data": response.json()}
        else:
            raise RuntimeError(f"Brevo API error ({response.status_code}): {response.text}")


def send_email(
    recipients: Union[str, List[str]],
    subject: str,
    html_content: str,
    sender_name: Optional[str] = None,
    sender_email: Optional[str] = None,
) -> dict:
    """Primary email dispatcher with automatic SMTP / API fallback."""
    try:
        return send_email_smtp(recipients, subject, html_content, sender_name, sender_email)
    except Exception as smtp_err:
        logger.warning(f"SMTP dispatch failed, trying API fallback: {smtp_err}")
        try:
            return send_email_api(recipients, subject, html_content, sender_name, sender_email)
        except Exception as api_err:
            logger.error(f"Both SMTP and API dispatch failed: {api_err}")
            raise api_err


def send_meeting_notice(
    recipient_emails: List[str],
    committee_name: str,
    meeting_title: str,
    scheduled_at: str,
    venue: str,
    agenda_highlights: Optional[str] = None,
) -> dict:
    """Convenience helper to send formatted institutional meeting notices."""
    subject = f"Official Meeting Notice: {committee_name} ({meeting_title})"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }}
            .header {{ background-color: #0A2540; color: #ffffff; padding: 25px 30px; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }}
            .header p {{ margin: 5px 0 0 0; color: #E8B943; font-size: 13px; font-weight: 600; text-transform: uppercase; }}
            .content {{ padding: 30px; color: #334155; font-size: 15px; line-height: 1.6; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 20px 0; }}
            .card-row {{ margin-bottom: 8px; }}
            .card-row:last-child {{ margin-bottom: 0; }}
            .card-label {{ font-weight: 700; color: #0f172a; font-size: 13px; text-transform: uppercase; }}
            .card-value {{ color: #475569; font-size: 14px; }}
            .footer {{ background-color: #f1f5f9; padding: 15px 30px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Vignan CommiAI — Meeting Notice</h1>
                <p>Statutory Institutional Governance</p>
            </div>
            <div class="content">
                <p>Dear Committee Member,</p>
                <p>You are hereby requested to attend the upcoming statutory session convened under the authority of the University Charter:</p>
                
                <div class="card">
                    <div class="card-row">
                        <div class="card-label">Committee:</div>
                        <div class="card-value"><strong>{committee_name}</strong></div>
                    </div>
                    <div class="card-row">
                        <div class="card-label">Session:</div>
                        <div class="card-value">{meeting_title}</div>
                    </div>
                    <div class="card-row">
                        <div class="card-label">Date & Time:</div>
                        <div class="card-value">{scheduled_at}</div>
                    </div>
                    <div class="card-row">
                        <div class="card-label">Venue:</div>
                        <div class="card-value">{venue}</div>
                    </div>
                </div>

                {f'<p><strong>Agenda Summary:</strong><br>{agenda_highlights}</p>' if agenda_highlights else ''}

                <p>Your presence is vital to satisfy the legal quorum requirement. Please confirm your attendance on the CommiAI Portal.</p>
            </div>
            <div class="footer">
                Vignan's Foundation for Science, Technology & Research (Deemed to be University)<br>
                Automated notification dispatched via Vignan CommiAI Governance Agent.
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(recipients=recipient_emails, subject=subject, html_content=html_content)
