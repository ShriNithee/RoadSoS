function formatPhone(phone) {
  const raw = String(phone || "").trim();
  if (!raw) {
    return "";
  }

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return raw;
  }

  return hasPlus ? `+${digits}` : digits;
}

export { formatPhone };
