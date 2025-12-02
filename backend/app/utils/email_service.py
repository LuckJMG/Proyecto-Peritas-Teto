import os
import smtplib
from email.message import EmailMessage
from typing import List


def send_email(to_addresses: List[str], subject: str, body: str) -> bool:
    """Send an email using SMTP. Returns True if sending succeeded."""
    if not to_addresses:
        return False

    host = os.getenv("SMTP_HOST")
    port = os.getenv("SMTP_PORT")
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_address = os.getenv("SMTP_FROM") or user or "no-reply@example.com"
    use_starttls = os.getenv("SMTP_STARTTLS", "true").lower() == "true"

    if not host or not port:
        print(f"[email] SMTP config missing; skipping send to {to_addresses} - subject: {subject}")
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = from_address
        msg["To"] = ",".join(to_addresses)
        msg.set_content(body)

        with smtplib.SMTP(host, int(port)) as server:
            if use_starttls:
                server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(msg)

        return True
    except Exception as exc:  # pragma: no cover - best-effort logging
        print(f"[email] failed to send to {to_addresses}: {exc}")
        return False
