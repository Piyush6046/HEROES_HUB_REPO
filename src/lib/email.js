import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "instructoplus@gmail.com",
    pass: process.env.EMAIL_PASS || "puzvgsougxscgled",
  },
});

export const sendWinnerEmail = async (email, name, prize, drawMonth) => {
  const mailOptions = {
    from: '"HeroesHub Awards" <instructoplus@gmail.com>',
    to: email,
    subject: "🏆 Congratulations! You are a HeroesHub Winner!",
    html: `
      <div style="font-family: 'Outfit', sans-serif; background: #0a0a0b; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #1e1e20;">
        <h1 style="color: #10b981; font-size: 32px; margin-bottom: 20px;">Jackpot Alert! ⛳</h1>
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 18px; line-height: 1.6;">We have exciting news! Your golf scores matched the winning numbers for the <strong>${drawMonth}</strong> draw.</p>
        
        <div style="background: rgba(16,185,129,0.1); border: 2px dashed #10b981; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="font-size: 14px; color: #10b981; font-weight: 700; text-transform: uppercase;">Your Prize Amount</div>
          <div style="font-size: 48px; font-weight: 900; color: #ffffff; margin-top: 10px;">$${prize.toFixed(2)}</div>
        </div>

        <p style="font-size: 16px; color: #a1a1aa;">To claim your prize, please login to your HeroesHub Dashboard and upload a screenshot of your official golf score proof within 7 days.</p>
        
        <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #10b981; color: #ffffff; padding: 18px 36px; border-radius: 99px; text-weight: 700; text-decoration: none; margin-top: 20px;">Claim Prize in Dashboard</a>
        
        <hr style="border: 0; border-top: 1px solid #1e1e20; margin: 40px 0;">
        <p style="font-size: 12px; color: #71717a;">© 2026 HeroesHub. This is a PRD-compliant notification for the Digital Heroes selection process.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPayoutUpdate = async (email, status) => {
  const statusColors = {
    paid: "#10b981",
    processing: "#3b82f6",
    rejected: "#ef4444"
  };

  const mailOptions = {
    from: '"HeroesHub Finance" <instructoplus@gmail.com>',
    to: email,
    subject: `Update on your Payout: ${status.toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Payout Update</h2>
        <p>Your payment status has been updated to: <strong style="color: ${statusColors[status] || '#555'}">${status.toUpperCase()}</strong></p>
        ${status === 'paid' ? '<p>The funds have been transferred to your registered account.</p>' : '<p>Our team is currently reviewing your submission.</p>'}
        <p>Login for more details.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
