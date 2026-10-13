// GET api/footer returns the footer as ["<text>"] on staging. Other IMIS
// backends have returned a plain string or { left, right: { label } }.
export const parseFooterText = (body) => {
  if (typeof body === "string") return body.trim() || null;
  if (Array.isArray(body)) {
    return typeof body[0] === "string" ? body[0].trim() || null : null;
  }
  if (body && typeof body === "object") {
    const text = [body.left, body.right?.label].filter(Boolean).join(" ").trim();
    return text || null;
  }
  return null;
};
