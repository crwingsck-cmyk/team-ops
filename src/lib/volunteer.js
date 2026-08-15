export function heqiHuaiXieliText(v) {
  const parts = [v.heQi, v.huAi, v.xieLi].filter(Boolean);
  if (parts.length > 0) return parts.join("-");
  return v.heqiHuaiXieli || "";
}
