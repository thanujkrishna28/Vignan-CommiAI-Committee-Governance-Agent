"""
Vignan CommiAI — Complete 13 Email Template Generator
All templates use the standard Vignan CommiAI institutional design system:
Primary: #2563EB, Header: #EAF4FF, BG: #F5F9FF, Card: #FFFFFF
"""
from typing import Dict, Any, Optional

def _wrap_base_template(title: str, preheader: str, content_html: str, action_btn_text: Optional[str] = None, action_btn_url: Optional[str] = None, footer_note: Optional[str] = None) -> str:
    """Wraps content in standard responsive institutional email container."""
    button_html = ""
    if action_btn_text:
        url = action_btn_url or "http://localhost:5173"
        button_html = f"""
        <div style="margin: 28px 0; text-align: left;">
            <a href="{url}" style="background-color: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">{action_btn_text} &rarr;</a>
        </div>
        """

    footer_text = footer_note or "This is an official automated institutional communication dispatched by Vignan CommiAI Governance Agent."

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #F5F9FF; color: #1E293B; margin: 0; padding: 24px 12px; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #DCE8F5; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
        
        <!-- Header -->
        <div style="background-color: #EAF4FF; padding: 24px 28px; border-bottom: 1px solid #DCE8F5;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <div style="color: #2563EB; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Vignan CommiAI</div>
                        <div style="color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">Committee Management Agent</div>
                    </td>
                    <td align="right">
                        <span style="background-color: #FFFFFF; color: #2563EB; border: 1px solid #BFDBFE; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">Statutory Portal</span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px;">
            <h1 style="color: #1E293B; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">{title}</h1>
            {content_html}
            {button_html}
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #DCE8F5; padding: 20px 28px; background-color: #FAFCFF; color: #64748B; font-size: 12px; line-height: 1.5; text-align: center;">
            <p style="margin: 0 0 6px 0;"><strong>Vignan's Foundation for Science, Technology & Research</strong> (Deemed to be University)</p>
            <p style="margin: 0; color: #94A3B8;">{footer_text}</p>
        </div>

    </div>
</body>
</html>"""


# ─── 13 Specific Template Generators ─────────────────────────────────────────

def render_template(service_name: str, data: Dict[str, Any]) -> Dict[str, str]:
    """
    Renders subject and HTML content for any of the 13 automated email services.
    """
    if service_name == "Meeting Notice & Agenda Circular Service":
        c_name = data.get("committee_name", "Statutory Committee")
        m_num = data.get("meeting_number", "Session")
        subject = f"Meeting Notice – {c_name} – Meeting No. {m_num}"
        content = f"""
        <p style="font-size: 15px; color: #475569;">Dear <strong>{data.get('member_name', 'Committee Member')}</strong>,</p>
        <p style="font-size: 15px; color: #475569;">You are requested to attend the upcoming meeting of the <strong>{c_name}</strong>.</p>
        
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #334155;">
                <tr><td width="35%" style="color: #64748B; font-weight: 600;">Committee:</td><td style="font-weight: 700; color: #0F172A;">{c_name}</td></tr>
                <tr><td style="color: #64748B; font-weight: 600;">Meeting Number:</td><td style="font-weight: 600;">{m_num}</td></tr>
                <tr><td style="color: #64748B; font-weight: 600;">Date & Time:</td><td><strong>{data.get('meeting_date', 'Scheduled Date')}</strong> ({data.get('start_time', '10:00 AM')} &ndash; {data.get('end_time', '12:00 PM')})</td></tr>
                <tr><td style="color: #64748B; font-weight: 600;">Venue / Mode:</td><td>{data.get('venue', 'Senate Hall')} ({data.get('mode', 'Hybrid / Physical')})</td></tr>
                {f"<tr><td style='color: #64748B; font-weight: 600;'>Meeting Link:</td><td><a href='{data.get('meeting_link')}' style='color: #2563EB;'>Join Video Conference</a></td></tr>" if data.get('meeting_link') else ""}
            </table>
        </div>

        <h3 style="color: #1E293B; font-size: 16px; margin: 20px 0 10px 0;">Agenda Items for Deliberation:</h3>
        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: #334155; line-height: 1.6;">
            {data.get('agenda_summary', '1. Confirmation of previous minutes<br>2. Statutory regulatory matters<br>3. Any other item with permission of the Chair.')}
        </div>
        <p style="font-size: 14px; color: #64748B; margin-top: 16px;">Please review the agenda and attached supporting documents prior to the session.</p>
        """
        html = _wrap_base_template("Meeting Notice & Agenda Circular", "Official Meeting Notice", content, "View Meeting Details", data.get("meeting_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Attendance RSVP & Calendar Invite Service":
        c_name = data.get("committee_name", "Statutory Committee")
        hours = data.get("hours_remaining", "24")
        subject = f"Reminder – {c_name} Meeting in {hours} Hours"
        content = f"""
        <p style="font-size: 15px; color: #475569;">Dear <strong>{data.get('member_name', 'Committee Member')}</strong>,</p>
        <p style="font-size: 15px; color: #475569;">This is a reminder that the <strong>{c_name}</strong> meeting is scheduled for:</p>
        
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> {data.get('meeting_date')}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Time:</strong> {data.get('start_time', '10:00 AM')}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Venue:</strong> {data.get('venue')}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Mode:</strong> {data.get('mode', 'Hybrid / Physical')}</p>
        </div>

        <p style="font-size: 14px; color: #475569; font-weight: 600;">Please confirm your attendance to guarantee statutory quorum readiness:</p>
        <div style="margin: 16px 0; display: flex; gap: 10px;">
            <a href="{data.get('rsvp_url', 'http://localhost:5173')}" style="background-color: #16A34A; color: #FFF; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 700; margin-right: 8px; display: inline-block;">Confirm Physical</a>
            <a href="{data.get('rsvp_url', 'http://localhost:5173')}" style="background-color: #2563EB; color: #FFF; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block;">Join Virtual</a>
        </div>
        """
        html = _wrap_base_template("Attendance Confirmation Required", "Attendance Reminder", content, "Confirm Attendance on Portal", data.get("rsvp_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Meeting Reschedule / Adjournment Alert Service":
        c_name = data.get("committee_name", "Statutory Committee")
        subject = f"Important Update – {c_name} Meeting Rescheduled"
        content = f"""
        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 14px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            &#9888; Notice: The schedule for this committee session has been modified.
        </div>
        <p style="font-size: 15px; color: #475569;">Please note the updated meeting particulars below:</p>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px; border: 1px solid #DCE8F5; border-radius: 8px; margin: 18px 0;">
            <tr style="background-color: #F8FAFC; font-weight: 700; color: #475569;">
                <td width="50%">PREVIOUS DETAILS</td>
                <td width="50%">NEW UPDATED DETAILS</td>
            </tr>
            <tr>
                <td style="color: #64748B; border-top: 1px solid #E2E8F0;">{data.get('prev_details', 'Original Date & Time')}</td>
                <td style="color: #0F172A; font-weight: 700; border-top: 1px solid #E2E8F0; background-color: #F0FDF4;">{data.get('new_details', 'New Date & Time')}</td>
            </tr>
        </table>
        {f"<p style='font-size: 14px; color: #475569;'><strong>Reason for Update:</strong> {data.get('reason')}</p>" if data.get('reason') else ""}
        """
        html = _wrap_base_template("Meeting Schedule Updated", "Schedule Update Alert", content, "View Updated Meeting", data.get("meeting_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Quorum Deficit Warning Service":
        c_name = data.get("committee_name", "Statutory Committee")
        subject = f"URGENT – Quorum Deficit Risk – {c_name}"
        content = f"""
        <div style="background-color: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="font-size: 16px; display: block; margin-bottom: 6px;">&#9888; Quorum Deficit Warning: Quorum at Risk</strong>
            <span style="font-size: 14px;">Confirmed attendance is currently below the required statutory threshold.</span>
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Meeting:</strong> {data.get('meeting_title', 'Session')}</p>
            <p style="margin: 4px 0;"><strong>Statutory Quorum Required:</strong> <span style="color: #2563EB; font-weight: 700;">{data.get('quorum_required', 6)} members</span></p>
            <p style="margin: 4px 0;"><strong>Currently Confirmed:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('confirmed_count', 4)} members</span></p>
            <p style="margin: 4px 0;"><strong>Shortfall:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('shortfall', 2)} members</span></p>
        </div>
        <p style="font-size: 14px; color: #DC2626; font-weight: 600;">IMPORTANT: Resolutions passed without valid statutory quorum may be subject to legal challenge or regulatory invalidation.</p>
        """
        html = _wrap_base_template("Quorum Deficit Warning", "Urgent Quorum Risk Alert", content, "Review Live Attendance Roster", data.get("meeting_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Authorized Quorum Override Audit Circular":
        c_name = data.get("committee_name", "Statutory Committee")
        m_title = data.get("meeting_title", "Session")
        subject = f"Quorum Override Recorded – {c_name} – {m_title}"
        content = f"""
        <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; padding: 14px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            &#128220; Official Audit Notice: An authorized quorum override has been formally logged.
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Meeting:</strong> {m_title}</p>
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> {data.get('timestamp')}</p>
            <p style="margin: 4px 0;"><strong>Authorized By:</strong> {data.get('override_by_name')} ({data.get('override_by_role')})</p>
            <p style="margin: 4px 0;"><strong>Attendance Recorded:</strong> {data.get('present_count')} of {data.get('total_members')} (Quorum rule: {data.get('quorum_required')})</p>
            <p style="margin: 12px 0 4px 0; font-weight: 700; color: #0F172A;">Statutory Justification Reason:</p>
            <div style="background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px 14px; color: #334155; font-style: italic;">
                &ldquo;{data.get('reason', 'Urgent administrative necessity per VC authorization.')}&rdquo;
            </div>
        </div>
        <p style="font-size: 12px; color: #64748B;">This notification forms an immutable part of the university governance audit record.</p>
        """
        html = _wrap_base_template("Authorized Quorum Override Audit Record", "Quorum Override Notice", content, "View Audit Log in Portal", data.get("audit_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Minutes Draft Approval Request Service":
        c_name = data.get("committee_name", "Statutory Committee")
        m_num = data.get("meeting_number", "")
        subject = f"Minutes Approval Required – {c_name} – Meeting {m_num}"
        content = f"""
        <p style="font-size: 15px; color: #475569;">Dear <strong>{data.get('approver_name', 'Registrar')}</strong>,</p>
        <p style="font-size: 15px; color: #475569;">The official draft minutes for the following statutory meeting have been prepared by the Convener and submitted for your executive review and signature.</p>
        
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Meeting:</strong> {data.get('meeting_title')}</p>
            <p style="margin: 4px 0;"><strong>Meeting Date:</strong> {data.get('meeting_date')}</p>
            <p style="margin: 4px 0;"><strong>Prepared By:</strong> {data.get('convener_name', 'Committee Convener')}</p>
            <p style="margin: 4px 0;"><strong>Approval Status:</strong> <span style="background-color: #FEF3C7; color: #92400E; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 12px;">PENDING APPROVAL</span></p>
        </div>
        <p style="font-size: 14px; color: #475569;">The draft includes recorded discussions, ratified resolutions, and assigned action item deliverables.</p>
        """
        html = _wrap_base_template("Minutes Draft Ready for Approval", "Minutes Approval Request", content, "Review & Authorize Minutes", data.get("minutes_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Ratified Minutes Official Broadcast Service":
        c_name = data.get("committee_name", "Statutory Committee")
        m_num = data.get("meeting_number", "")
        subject = f"Ratified Minutes – {c_name} – Meeting {m_num}"
        content = f"""
        <p style="font-size: 15px; color: #475569;">The official minutes of the <strong>{c_name}</strong> meeting held on <strong>{data.get('meeting_date')}</strong> have been formally reviewed, ratified, and digitally signed by the Registrar.</p>
        
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0; color: #065F46;"><strong>Status:</strong> <span style="background-color: #16A34A; color: #FFF; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 11px;">RATIFIED & SEALED</span></p>
            <p style="margin: 4px 0; color: #065F46;"><strong>Meeting:</strong> {data.get('meeting_title')}</p>
            <p style="margin: 4px 0; color: #065F46;"><strong>Ratified Date:</strong> {data.get('ratified_date')}</p>
        </div>

        <h3 style="color: #1E293B; font-size: 16px; margin: 20px 0 10px 0;">Key Ratified Resolutions:</h3>
        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; font-size: 14px; color: #334155; line-height: 1.6;">
            {data.get('resolutions_summary', 'All proposed items were approved and entered into the institutional register.')}
        </div>
        """
        html = _wrap_base_template("Official Ratified Minutes", "Ratified Minutes Circular", content, "View Certified Minutes PDF", data.get("minutes_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Action Item Assignment Dispatcher":
        subject = f"Action Assigned – {data.get('action_title', 'Committee Action Deliverable')}"
        p_color = "#DC2626" if data.get("priority") == "CRITICAL" else "#D97706" if data.get("priority") == "HIGH" else "#2563EB"
        content = f"""
        <p style="font-size: 15px; color: #475569;">Dear <strong>{data.get('owner_name', 'Responsible Official')}</strong>,</p>
        <p style="font-size: 15px; color: #475569;">A new action item resulting from committee deliberations has been officially assigned to you:</p>
        
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Action Item:</strong> <span style="font-size: 15px; font-weight: 700; color: #0F172A;">{data.get('action_title')}</span></p>
            <p style="margin: 4px 0;"><strong>Origin Committee:</strong> {data.get('committee_name')}</p>
            <p style="margin: 4px 0;"><strong>Ref Meeting:</strong> {data.get('meeting_title')}</p>
            <p style="margin: 4px 0;"><strong>Target Deadline:</strong> <strong style="color: #DC2626;">{data.get('due_date')}</strong></p>
            <p style="margin: 4px 0;"><strong>Priority Level:</strong> <span style="color: {p_color}; font-weight: 800;">{data.get('priority', 'HIGH')}</span></p>
        </div>
        <p style="font-size: 14px; color: #64748B;">Please update progress on the CommiAI Action Desk prior to the deadline.</p>
        """
        html = _wrap_base_template("New Committee Action Assigned", "Action Assignment", content, "View & Update Action Item", data.get("action_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Action Item Deadline & Escalation Reminder Service":
        days = data.get("days_remaining", 3)
        is_overdue = days < 0
        subject = f"OVERDUE – Committee Action Requires Attention" if is_overdue else f"Reminder – Action Due in {days} Days"
        content = f"""
        <div style="background-color: {'#FEE2E2' if is_overdue else '#FFFBEB'}; border: 1px solid {'#FCA5A5' if is_overdue else '#FCD34D'}; color: {'#991B1B' if is_overdue else '#92400E'}; padding: 14px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 20px;">
            {'&#9888; Action Overdue Notice: This deliverable has exceeded its target deadline.' if is_overdue else f'&#9200; Action Deadline Approaching ({days} days remaining)'}
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Deliverable:</strong> {data.get('action_title')}</p>
            <p style="margin: 4px 0;"><strong>Committee:</strong> {data.get('committee_name')}</p>
            <p style="margin: 4px 0;"><strong>Due Date:</strong> {data.get('due_date')}</p>
            <p style="margin: 4px 0;"><strong>Current Status:</strong> <span style="font-weight: 700;">{data.get('status', 'IN_PROGRESS')}</span></p>
        </div>
        """
        html = _wrap_base_template("Action Item Escalation Notice", "Action Deadline Alert", content, "Update Action Status", data.get("action_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Action Taken Report (ATR) Compilation Circular":
        c_name = data.get("committee_name", "Statutory Committee")
        m_num = data.get("meeting_number", "")
        subject = f"Action Taken Report – {c_name} – Meeting {m_num}"
        content = f"""
        <p style="font-size: 15px; color: #475569;">The consolidated <strong>Action Taken Report (ATR)</strong> for previous resolutions of the <strong>{c_name}</strong> is now compiled and ready for review ahead of the upcoming agenda.</p>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Total Actions Tracked:</strong> {data.get('total_actions', 6)}</p>
            <p style="margin: 4px 0;"><strong>Completed:</strong> <span style="color: #16A34A; font-weight: 700;">{data.get('completed_count', 4)}</span></p>
            <p style="margin: 4px 0;"><strong>In Progress:</strong> <span style="color: #2563EB; font-weight: 700;">{data.get('in_progress_count', 1)}</span></p>
            <p style="margin: 4px 0;"><strong>Overdue:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('overdue_count', 1)}</span></p>
        </div>
        """
        html = _wrap_base_template("Action Taken Report (ATR)", "ATR Circular", content, "View Consolidated ATR", data.get("atr_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Member Tenure Expiry Early-Warning Service":
        m_name = data.get("member_name", "Committee Member")
        c_name = data.get("committee_name", "Statutory Committee")
        subject = f"Tenure Expiry Alert – {m_name} – {c_name}"
        content = f"""
        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 14px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            &#9203; Statutory Tenure Notice: Appointed term is approaching expiry.
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Member Name:</strong> {m_name}</p>
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Role / Position:</strong> {data.get('role', 'Faculty Member')}</p>
            <p style="margin: 4px 0;"><strong>Expiry Date:</strong> <strong style="color: #DC2626;">{data.get('expiry_date')}</strong></p>
            <p style="margin: 4px 0;"><strong>Days Remaining:</strong> <strong>{data.get('days_remaining', 18)} days</strong></p>
        </div>
        <p style="font-size: 14px; color: #475569;"><strong>Recommended Action:</strong> Initiate nomination and reconstitution procedures before the statutory term lapses.</p>
        """
        html = _wrap_base_template("Committee Member Tenure Expiry Warning", "Tenure Expiry Alert", content, "Review Committee Memberships", data.get("committee_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Statutory Composition Deficit Alert Service":
        c_name = data.get("committee_name", "Statutory Committee")
        subject = f"STATUTORY COMPOSITION ALERT – {c_name}"
        content = f"""
        <div style="background-color: #FEE2E2; border: 1px solid #FCA5A5; color: #991B1B; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="font-size: 16px; display: block; margin-bottom: 4px;">&#9888; NON-COMPLIANT STATUTORY BODY DETECTED</strong>
            <span style="font-size: 14px;">Mandatory composition criteria under regulatory framework is not satisfied.</span>
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Violated Requirement:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('requirement_name', 'External Industry Expert')}</span></p>
            <p style="margin: 4px 0;"><strong>Statutory Source:</strong> {data.get('regulation_source', 'UGC Regulations 2024 Section 4.2')}</p>
            <p style="margin: 4px 0;"><strong>Required Count:</strong> {data.get('required_count', 1)} | <strong>Current Active:</strong> {data.get('current_count', 0)} | <strong>Deficit:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('deficit', 1)}</span></p>
        </div>
        <p style="font-size: 14px; color: #334155;"><strong>Remediation Recommendation:</strong><br>{data.get('recommendation', 'Initiate nomination of eligible candidate for Vice Chancellor approval.')}</p>
        """
        html = _wrap_base_template("Mandatory Committee Composition Deficit", "Statutory Composition Alert", content, "Launch Compliance Diagnostics", data.get("compliance_url"))
        return {"subject": subject, "html": html}

    elif service_name == "Overdue Statutory Meeting Alert Service":
        c_name = data.get("committee_name", "Statutory Committee")
        subject = f"OVERDUE STATUTORY MEETING – {c_name}"
        content = f"""
        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 14px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 20px;">
            &#9888; Meeting Frequency Breach: Committee has exceeded statutory meeting interval.
        </div>
        <div style="background-color: #F5F9FF; border: 1px solid #DCE8F5; border-radius: 10px; padding: 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Committee:</strong> {c_name}</p>
            <p style="margin: 4px 0;"><strong>Mandatory Frequency:</strong> {data.get('required_frequency', '4 meetings per year')}</p>
            <p style="margin: 4px 0;"><strong>Last Convened:</strong> {data.get('last_meeting_date', 'Over 6 months ago')}</p>
            <p style="margin: 4px 0;"><strong>Days Overdue:</strong> <span style="color: #DC2626; font-weight: 700;">{data.get('days_overdue', 45)} days</span></p>
        </div>
        <p style="font-size: 14px; color: #475569;"><strong>Recommended Action:</strong> Convene the next regular committee session immediately to maintain NAAC/UGC governance alignment.</p>
        """
        html = _wrap_base_template("Committee Meeting Frequency Alert", "Overdue Meeting Notice", content, "Convene Session Now", data.get("meeting_url"))
        return {"subject": subject, "html": html}

    else:
        subject = f"Institutional Notification — {data.get('title', 'Vignan CommiAI')}"
        content = f"<p style='font-size: 15px; color: #475569;'>{data.get('message', 'Notification from Vignan CommiAI governance agent.')}</p>"
        html = _wrap_base_template(data.get('title', 'Governance Notification'), "Notification", content, "Open Portal", "http://localhost:5173")
        return {"subject": subject, "html": html}
