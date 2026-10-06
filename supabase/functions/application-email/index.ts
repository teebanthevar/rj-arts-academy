// Supabase Edge Function: send-application-email
// Sends an email to the parent when an application is received (INSERT)
// and when the admin approves or rejects it (UPDATE of status).
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FROM_NAME = "RJ Arts Academy";
const GMAIL_USER = Deno.env.get("GMAIL_USER")!; // rjartsacademy@gmail.com
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
// Comma-separated admin emails allowed to trigger status emails, e.g. "admin@gmail.com,other@gmail.com"
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const esc = (s = "") =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function wrap(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f2e9;font-family:Arial,Helvetica,sans-serif;color:#1d2b25">
  <div style="max-width:560px;margin:0 auto;padding:24px 12px">
    <div style="background:#3b6a55;color:#fff;padding:22px 26px;border-radius:16px 16px 0 0">
      <div style="font-size:13px;letter-spacing:1px;color:#d9c2a0">RJ ARTS ACADEMY</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">${esc(title)}</div>
    </div>
    <div style="background:#fff;padding:26px;border-radius:0 0 16px 16px;line-height:1.6;font-size:15px">
      ${bodyHtml}
      <p style="margin-top:28px;color:#51625d;font-size:13px">RJ Arts Academy &middot; Learn, Create, Grow<br>rjartsacademy.com</p>
    </div>
  </div></body></html>`;
}

function buildEmail(type: string, rec: any, old: any) {
  const student = esc(rec.student_name);
  const mode = rec.class_mode;

  if (type === "INSERT") {
    return {
      subject: "We received your application - RJ Arts Academy",
      text: `Hello,\n\nThank you for applying to the RJ Arts Academy Free Art Class. We have received the application for ${rec.student_name}.\n\nStatus: Pending review\n\nOur team will review it and contact you by WhatsApp or email. You do not need to apply again.\n\nRJ Arts Academy`,
      html: wrap(
        "Application received",
        `<p>Hello,</p>
         <p>Thank you for applying to the <b>Free Art Class</b>. We have received the application for <b>${student}</b>.</p>
         <p style="background:#fff3d6;color:#6b4a00;display:inline-block;padding:6px 14px;border-radius:999px;font-weight:bold">Status: Pending review</p>
         <p>Our team will review it and contact you by WhatsApp or email. You do not need to apply again.</p>`,
      ),
    };
  }

  if (rec.status === "approved") {
    const classLine = mode === "Physical"
      ? "Your child will join our <b>physical class</b>. We will share the location, days and time soon."
      : "Your child will join our <b>online class</b>. We will share the joining details, days and time soon.";
    return {
      subject: "Your Free Art Class application is approved - RJ Arts Academy",
      text: `Hello,\n\nGood news! The application for ${rec.student_name} has been approved.\n\nStatus: Approved\n\n${mode === "Physical" ? "Your child will join our physical class. We will share the location, days and time soon." : "Your child will join our online class. We will share the joining details, days and time soon."}\n\nWe look forward to welcoming you to our art family.\n\nRJ Arts Academy`,
      html: wrap(
        "Application approved",
        `<p>Hello,</p>
         <p>Good news! The application for <b>${student}</b> has been approved.</p>
         <p style="background:#d9f2e1;color:#0f3d22;display:inline-block;padding:6px 14px;border-radius:999px;font-weight:bold">Status: Approved</p>
         <p>${classLine}</p>
         <p>We look forward to welcoming you to our art family.</p>`,
      ),
    };
  }

  // rejected
  return {
    subject: "Update on your Free Art Class application - RJ Arts Academy",
    text: `Hello,\n\nThank you for applying for ${rec.student_name}. After reviewing the applications, we are unable to offer a place at this time, as places are limited.\n\nStatus: Not approved\n\nIf you have any questions, please contact us through the details on rjartsacademy.com.\n\nRJ Arts Academy`,
    html: wrap(
      "Application update",
      `<p>Hello,</p>
       <p>Thank you for applying for <b>${student}</b>. After reviewing the applications, we are unable to offer a place at this time, as places are limited.</p>
       <p style="background:#fde7e5;color:#b3261e;display:inline-block;padding:6px 14px;border-radius:999px;font-weight:bold">Status: Not approved</p>
       <p>If you have any questions, please contact us through the details on our website.</p>`,
    ),
  };
}

async function sendMail(rec: any, type: string) {
  const mail = buildEmail(type, rec, null);
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
    },
  });
  await client.send({
    from: `${FROM_NAME} <${GMAIL_USER}>`,
    to: rec.email,
    subject: mail.subject,
    content: mail.text,
    html: mail.html,
  });
  await client.close();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const reply = (text: string, status = 200) => new Response(text, { status, headers: cors });

  try {
    const body = await req.json();

    // A) Database webhook: a new application was submitted
    const secret = req.headers.get("x-webhook-secret");
    if (secret) {
      if (secret !== WEBHOOK_SECRET) return reply("Unauthorized", 401);
      if (body.type !== "INSERT" || !body.record?.email) return reply("Skipped");
      await sendMail(body.record, "INSERT");
      return reply("Sent");
    }

    // B) Admin page: Approve / Reject was clicked
    const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: auth } = await supa.auth.getUser(token);
    const email = auth?.user?.email?.toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) return reply("Forbidden", 403);

    const { data: rec, error } = await supa.from("applications").select("*").eq("id", body.application_id).single();
    if (error || !rec) return reply("Application not found", 404);
    if (!rec.email) return reply("This application has no email address", 422);
    if (rec.status !== "approved" && rec.status !== "rejected") return reply("Nothing to send");

    await sendMail(rec, "STATUS");
    return reply("Sent");
  } catch (e) {
    console.error(e);
    return reply("Error: " + (e as Error).message, 500);
  }
});