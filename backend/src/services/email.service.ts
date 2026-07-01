import nodemailer from "nodemailer";
import type { Order, OrderItem, User } from "../generated/prisma/client.js";

export type OrderWithEmailDetails = Order & {
  user: Pick<User, "email" | "fullName"> | null;
  items: Pick<OrderItem, "bookTitle" | "quantity" | "unitPrice" | "totalPrice">[];
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatMoney(value: { toString(): string }) {
  return currencyFormatter.format(Number(value));
}

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM ?? user;

  if (!host || !user || !pass || !from) return null;
  return { host, port, user, pass, from };
}

function createTransporter() {
  const config = getEmailConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

function buildOrderItemsHtml(items: OrderWithEmailDetails["items"]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1e7dd;color:#3B2416;font-weight:700;">
            ${item.bookTitle}
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1e7dd;text-align:center;color:#78716C;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1e7dd;text-align:right;color:#78716C;">
            ${formatMoney(item.unitPrice)}
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1e7dd;text-align:right;color:#92400E;font-weight:800;">
            ${formatMoney(item.totalPrice)}
          </td>
        </tr>
      `,
    )
    .join("");
}

function buildOrderConfirmationHtml(order: OrderWithEmailDetails) {
  const customerName = order.shippingName || order.user?.fullName || "bạn";
  const paymentLabel = order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng";

  return `
    <div style="margin:0;padding:0;background:#FEF9F0;font-family:Inter,Arial,sans-serif;color:#1C1917;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="background:#3B2416;border-radius:28px;padding:28px;color:#FFF7ED;margin-bottom:18px;">
          <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#F59E0B;font-weight:800;">BBooks</div>
          <h1 style="margin:12px 0 8px;font-family:Georgia,serif;font-size:34px;line-height:1.15;">Đặt hàng thành công!</h1>
          <p style="margin:0;color:rgba(255,247,237,.78);line-height:1.7;">
            Cảm ơn ${customerName} đã mua sách tại BBooks. Đơn hàng của bạn đã được ghi nhận.
          </p>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E7E5E4;border-radius:24px;padding:24px;margin-bottom:18px;">
          <h2 style="margin:0 0 16px;color:#3B2416;font-size:20px;">Thông tin đơn hàng</h2>
          <p style="margin:8px 0;color:#78716C;">Mã đơn: <strong style="color:#3B2416;">${order.orderCode}</strong></p>
          <p style="margin:8px 0;color:#78716C;">Người nhận: <strong style="color:#3B2416;">${order.shippingName}</strong></p>
          <p style="margin:8px 0;color:#78716C;">Số điện thoại: <strong style="color:#3B2416;">${order.shippingPhone}</strong></p>
          <p style="margin:8px 0;color:#78716C;">Địa chỉ: <strong style="color:#3B2416;">${order.shippingAddress}</strong></p>
          <p style="margin:8px 0;color:#78716C;">Thanh toán: <strong style="color:#3B2416;">${paymentLabel}</strong></p>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E7E5E4;border-radius:24px;overflow:hidden;margin-bottom:18px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#FFF7ED;color:#3B2416;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">
                <th style="padding:12px;text-align:left;">Sách</th>
                <th style="padding:12px;text-align:center;">SL</th>
                <th style="padding:12px;text-align:right;">Đơn giá</th>
                <th style="padding:12px;text-align:right;">Tổng</th>
              </tr>
            </thead>
            <tbody>${buildOrderItemsHtml(order.items)}</tbody>
          </table>
          <div style="padding:18px 24px;background:#3B2416;color:#FFF7ED;">
            <p style="margin:6px 0;color:rgba(255,247,237,.75);">Tạm tính: <strong>${formatMoney(order.subtotal)}</strong></p>
            <p style="margin:6px 0;color:rgba(255,247,237,.75);">Phí vận chuyển: <strong>${formatMoney(order.shippingFee)}</strong></p>
            <p style="margin:14px 0 0;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);font-size:20px;">
              Tổng thanh toán: <strong style="color:#F59E0B;">${formatMoney(order.total)}</strong>
            </p>
          </div>
        </div>

        <p style="text-align:center;color:#78716C;font-size:13px;line-height:1.7;">
          BBooks sẽ liên hệ để xác nhận và xử lý đơn trong thời gian sớm nhất.<br />
          Nếu bạn không thực hiện đơn hàng này, vui lòng bỏ qua email hoặc liên hệ BBooks.
        </p>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: OrderWithEmailDetails) {
  if (!order.user?.email) return;

  const config = getEmailConfig();
  const transporter = createTransporter();

  if (!config || !transporter) {
    console.info("[mail] SMTP is not configured; skipped order confirmation email", {
      orderCode: order.orderCode,
    });
    return;
  }

  await transporter.sendMail({
    from: config.from,
    to: order.user.email,
    subject: `BBooks xác nhận đơn hàng ${order.orderCode}`,
    html: buildOrderConfirmationHtml(order),
  });
}
