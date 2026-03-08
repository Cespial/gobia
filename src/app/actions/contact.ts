"use server";

export async function submitContactForm(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const entidad = formData.get("entidad") as string;
  const cargo = formData.get("cargo") as string;
  const email = formData.get("email") as string;

  if (!nombre || !entidad || !cargo || !email) {
    return { success: false, error: "Todos los campos son requeridos." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Correo electrónico no válido." };
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Gobia <onboarding@resend.dev>",
          to: [process.env.CONTACT_EMAIL || "cristian@inplux.co"],
          subject: `Nuevo lead gobia.co: ${nombre} — ${entidad}`,
          html: `
            <h2>Nuevo lead desde gobia.co</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;">
              <tr><td style="padding:6px 12px;font-weight:bold;">Nombre</td><td style="padding:6px 12px;">${nombre}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:bold;">Entidad</td><td style="padding:6px 12px;">${entidad}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:bold;">Cargo</td><td style="padding:6px 12px;">${cargo}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${email}</td></tr>
            </table>
          `,
        }),
      });

      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    } catch (err) {
      console.error("Error sending email:", err);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log("📧 New lead (no RESEND_API_KEY configured):", {
      nombre,
      entidad,
      cargo,
      email,
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true };
}
