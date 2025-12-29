export const bookingConfirmationHTML = ({
  fullName,
  bookingId,
  packageName,
  bookingDate,
  arrivalDate,
  departureDate,
  vehicle,
  totalAmount,
  ownerEmail,
}: {
  fullName: string;
  bookingId: string;
  packageName: string;
  bookingDate: string;
  arrivalDate: string;
  departureDate: string;
  vehicle: string;
  totalAmount: number;
  ownerEmail: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f8fb;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    h2 {
      color: #1f2937;
    }
    .section {
      margin-top: 20px;
    }
    .label {
      font-weight: bold;
      color: #374151;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #6b7280;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 16px 0;
    }
  </style>
</head>

<body>
  <div class="container">
    <h2>🎉 Booking Confirmed</h2>

    <p>Hello <strong>${fullName}</strong>,</p>

    <p>
      We’re happy to let you know that your booking has been
      <strong>successfully confirmed</strong>.
    </p>

    <div class="divider"></div>

    <div class="section">
      <p><span class="label">Booking ID:</span> ${bookingId}</p>
      <p><span class="label">Package:</span> ${packageName}</p>
      <p><span class="label">Booking Date:</span> ${bookingDate}</p>
      <p><span class="label">Arrival Date:</span> ${arrivalDate}</p>
      <p><span class="label">Departure Date:</span> ${departureDate}</p>
      <p><span class="label">Vehicle:</span> ${vehicle}</p>
      <p><span class="label">Total Payment:</span> ₹${totalAmount}</p>
    </div>

    <div class="divider"></div>

    <p>
      For any questions, feel free to contact us at:
      <br />
      <strong>${ownerEmail}</strong>
    </p>

    <div class="footer">
      <p>
        We look forward to welcoming you to the beautiful
        <strong>Kingdom of Bhutan 🇧🇹</strong>
      </p>
      <p>Warm regards,<br />Bhutan Travel Team</p>
    </div>
  </div>
</body>
</html>
`;
