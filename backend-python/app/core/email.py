import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger("smartattendance.email")


class EmailService:
    def __init__(
        self,
        smtp_host: Optional[str] = None,
        smtp_port: Optional[int] = None,
        smtp_user: Optional[str] = None,
        smtp_password: Optional[str] = None,
        from_address: Optional[str] = None,
        from_name: Optional[str] = None,
        use_tls: bool = True,
    ):
        self.smtp_host = smtp_host or getattr(settings, "SMTP_HOST", None)
        self.smtp_port = smtp_port or getattr(settings, "SMTP_PORT", 587)
        self.smtp_user = smtp_user or getattr(settings, "SMTP_USER", None)
        self.smtp_password = smtp_password or getattr(settings, "SMTP_PASSWORD", None)
        self.from_address = from_address or getattr(settings, "SMTP_FROM_ADDRESS", "noreply@smartattendance.com")
        self.from_name = from_name or getattr(settings, "SMTP_FROM_NAME", "Smart Attendance")
        self.use_tls = use_tls

    @property
    def is_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    def send_email(self, to_address: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
        if not self.is_configured:
            logger.warning("Email service not configured — skipping email to %s", to_address)
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_address}>"
            msg["To"] = to_address

            msg.attach(MIMEText(text_body or html_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_address, [to_address], msg.as_string())

            logger.info("Email sent successfully to %s", to_address)
            return True
        except Exception:
            logger.exception("Failed to send email to %s", to_address)
            return False

    def send_password_reset_email(self, to_address: str, reset_token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        subject = "Reset Your Smart Attendance Password"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your Smart Attendance account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="margin: 30px 0;">
                <a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 12px 24px;
                   text-decoration: none; border-radius: 4px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p>Or copy and paste this link:</p>
            <p style="word-break: break-all; color: #666;">{reset_url}</p>
            <p style="color: #999; font-size: 12px;">
                This link expires in 30 minutes. If you didn't request this, please ignore this email.
            </p>
        </body>
        </html>
        """
        text_body = f"""
Password Reset Request

You requested a password reset for your Smart Attendance account.

Reset your password by visiting this link:
{reset_url}

This link expires in 30 minutes. If you didn't request this, please ignore this email.
        """
        return self.send_email(to_address, subject, html_body, text_body)

    def send_otp_email(self, to_address: str, otp: str) -> bool:
        subject = "Your Smart Attendance OTP"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Your Attendance OTP</h2>
            <p>Your one-time password for attendance marking is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; margin: 30px 0;">
                {otp}
            </p>
            <p style="color: #999; font-size: 12px;">
                This OTP expires in {settings.OTP_DEFAULT_TTL_MINUTES} minutes. Do not share it with anyone.
            </p>
        </body>
        </html>
        """
        text_body = f"Your Smart Attendance OTP: {otp}\n\nThis OTP expires in {settings.OTP_DEFAULT_TTL_MINUTES} minutes."
        return self.send_email(to_address, subject, html_body, text_body)


email_service = EmailService()
