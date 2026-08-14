package com.phuc.ticketbooking.common.email.impl;

import com.phuc.ticketbooking.common.email.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import com.phuc.ticketbooking.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends application emails via JavaMailSender (SMTP).
 *
 * <p>Template is an inline HTML email — no external template engine dependency.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private final AppProperties appProperties;

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(appProperties.mail().from());
            helper.setTo(toEmail);
            helper.setSubject("Mã OTP đặt lại mật khẩu — TicketBooking");
            helper.setText(buildOtpEmailHtml(otp), true);

            mailSender.send(message);
            log.info("Password reset OTP email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private String buildOtpEmailHtml(String otp) {
        int expiryMinutes = appProperties.otp().expirySeconds() / 60;
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Đặt lại mật khẩu</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;overflow:hidden;
                                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#4f46e5 0%%,#7c3aed 100%%);
                                        padding:32px 40px;text-align:center;">
                              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;
                                          letter-spacing:-0.5px;">🎟 TicketBooking</h1>
                              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                                Đặt lại mật khẩu của bạn
                              </p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px 40px 32px;">
                              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                                Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP bên dưới để tiếp tục:
                              </p>
                              <!-- OTP Box -->
                              <div style="background:#f0eeff;border:2px dashed #4f46e5;
                                          border-radius:12px;padding:28px;text-align:center;
                                          margin:24px 0;">
                                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;
                                            letter-spacing:2px;font-weight:600;">Mã OTP của bạn</p>
                                <span style="font-size:42px;font-weight:800;color:#4f46e5;
                                             letter-spacing:12px;font-family:'Courier New',monospace;">
                                  %s
                                </span>
                                <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">
                                  Mã có hiệu lực trong <strong>%d phút</strong>
                                </p>
                              </div>
                              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                                ⚠️ <strong>Không chia sẻ mã OTP này với bất kỳ ai.</strong>
                                Đội ngũ TicketBooking sẽ không bao giờ hỏi mã OTP của bạn.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                                        padding:20px 40px;text-align:center;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;">
                                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.<br/>
                                © 2025 TicketBooking. All rights reserved.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(otp, expiryMinutes);
    }
}
