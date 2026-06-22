import nodemailer from "nodemailer";

const getTransporter = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: process.env.EMAIL_USER
        ? {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
        : undefined,
});

export const sendAssignmentEmail = async ({
    to,
    name,
    taskTitle,
    priority,
    dueDate,
    taskId,
}) => {
    const link = `${process.env.APP_URL}/task/${taskId}`;
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `You've been assigned: ${taskTitle}`,
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
<div style="background:#0068B5;padding:24px 32px;border-radius:8px 8px 0 0;">
<h2 style="color:#fff;margin:0;font-size:18px;">New Task Assignment</h2>
</div>
<div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
<p style="margin:0 0 16px;color:#374151;">You have been assigned to a new task:</p>
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:20px;">
<p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">${taskTitle}</p>
<p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Priority: <strong style="color:#111827;text-transform:capitalize;">${priority}</strong></p>
${dueDate ? `<p style="margin:0;color:#6b7280;font-size:13px;">Due: <strong style="color:#111827;">${new Date(dueDate).toDateString()}</strong></p>` : ""}
</div>
<a href="${link}" style="display:inline-block;background:#0068B5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Task</a>
</div>
</div>
`,
    });
};

export const sendDueSoonEmail = async ({
    to,
    name,
    taskTitle,
    dueDate,
    taskId,
}) => {
    const link = `${process.env.APP_URL}/task/${taskId}`;
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Due in 24 hours: ${taskTitle}`,
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
<div style="background:#d97706;padding:24px 32px;border-radius:8px 8px 0 0;">
<h2 style="color:#fff;margin:0;font-size:18px;">Task Due Soon</h2>
</div>
<div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
<p style="margin:0 0 16px;color:#374151;">A task you're assigned to is due within 24 hours:</p>
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:20px;">
<p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">${taskTitle}</p>
<p style="margin:0;color:#d97706;font-size:13px;">Due: <strong>${new Date(dueDate).toDateString()}</strong></p>
</div>
<a href="${link}" style="display:inline-block;background:#0068B5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Task</a>
</div>
</div>
`,
    });
};

export const sendOverdueEmail = async ({
    to,
    name,
    taskTitle,
    dueDate,
    taskId,
}) => {
    const link = `${process.env.APP_URL}/task/${taskId}`;
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Overdue task: ${taskTitle}`,
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
<div style="background:#dc2626;padding:24px 32px;border-radius:8px 8px 0 0;">
<h2 style="color:#fff;margin:0;font-size:18px;">Task Overdue</h2>
</div>
<div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
<p style="margin:0 0 16px;color:#374151;">A task you're assigned to is now overdue:</p>
<div style="background:#fff;border:1px solid #fecaca;border-radius:6px;padding:16px;margin-bottom:20px;">
<p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">${taskTitle}</p>
<p style="margin:0;color:#dc2626;font-size:13px;">Was due: <strong>${new Date(dueDate).toDateString()}</strong></p>
</div>
<a href="${link}" style="display:inline-block;background:#0068B5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Task</a>
</div>
</div>
`,
    });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Reset your SGTM password",
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
<div style="background:#0068B5;padding:24px 32px;border-radius:8px 8px 0 0;">
<h2 style="color:#fff;margin:0;font-size:18px;">Password Reset Request</h2>
</div>
<div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
<p style="margin:0 0 16px;color:#374151;">Hi ${name},</p>
<p style="margin:0 0 16px;color:#374151;">You requested a password reset. Click the button below — this link expires in 1 hour.</p>
<a href="${resetUrl}" style="display:inline-block;background:#0068B5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Reset Password</a>
<p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">If you didn't request this, ignore this email.</p>
</div>
</div>
`,
    });
};

