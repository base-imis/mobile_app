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

// The API joins footer parts with "|"; each part is shown on its own line.
export const footerLines = (text) =>
  String(text ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

// Splits a line into plain and link segments so known labels (licence,
// company name) can be made tappable wherever the API places them.
export const linkSegments = (line, labels) => {
  const found = labels.filter((label) => label && line.includes(label));
  if (!found.length) return [{ text: line, link: null }];
  const escaped = found.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return line
    .split(new RegExp(`(${escaped.join("|")})`))
    .filter(Boolean)
    .map((text) => ({ text, link: found.includes(text) ? text : null }));
};
