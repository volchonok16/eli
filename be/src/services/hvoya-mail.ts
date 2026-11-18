import nodemailer from "nodemailer";
import { config } from "../config.js";

export class HvoyaMailError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function sendHvoyaCode(code: string): Promise<void> {
  const smtp = config.hvoyaSmtp;
  if (!smtp.user || !smtp.pass || !smtp.to) {
    throw new HvoyaMailError("Почта для кода Хвои не настроена");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  try {
    await transporter.sendMail({
      from: smtp.user,
      to: smtp.to,
      subject: "Код подтверждения API Хвои",
      text: [
        `Код подтверждения: ${code}`,
        "Код действует 24 часа.",
        "Новое письмо с кодом придёт не раньше чем через сутки.",
      ].join("\n"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Хвоя: не удалось отправить код (${message})`);
    throw new HvoyaMailError("Не удалось отправить код на почту");
  }
}
