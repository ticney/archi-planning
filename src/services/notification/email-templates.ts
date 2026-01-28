const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const getRejectionEmailTemplate = (projectTitle: string, reason: string, link: string) => `
  <h1>Project Request Rejected</h1>
  <p>Your governance request for project "<strong>${escapeHtml(projectTitle)}</strong>" has been rejected.</p>
  <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
  <p><a href="${link}">View Request</a></p>
`;

export const getReadyToBookEmailTemplate = (projectTitle: string, link: string) => `
  <h1>Project Validated</h1>
  <p>Your governance request for project "<strong>${escapeHtml(projectTitle)}</strong>" has been validated.</p>
  <p>You can now proceed to book a presentation slot.</p>
  <p><a href="${link}">Book Slot</a></p>
`;

export const getConfirmationEmailTemplate = (projectTitle: string, slotDate: Date, duration: number) => `
  <h1>Booking Confirmed</h1>
  <p>Your presentation for project "<strong>${escapeHtml(projectTitle)}</strong>" has been confirmed.</p>
  <p><strong>Date:</strong> ${slotDate.toLocaleString()}</p>
  <p><strong>Duration:</strong> ${duration} minutes</p>
  <p>A calendar invitation is attached.</p>
`;
