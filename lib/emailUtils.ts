/**
 * Mock email utility to simulate sending emails.
 * In a production environment, this would call a backend API or a service like SendGrid/Resend.
 */
export const sendEmailNotification = async (to: string, subject: string, body: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`%c[EMAIL SENT] To: ${to} | Subject: ${subject}`, 'color: #007bff; font-weight: bold;');
  console.log(`Body: ${body}`);

  // This is where you would integrate with a real email service:
  /*
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to send email:', error);
  }
  */

  return { success: true, messageId: `msg_${Date.now()}` };
};
