export function formatRelativeTime(timestamp) {
  if (!timestamp?.toDate) return "";
  const diffMs = Date.now() - timestamp.toDate().getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return timestamp.toDate().toISOString().slice(0, 10);
}

export function daysSince(timestamp) {
  if (!timestamp?.toDate) return 0;
  return Math.floor((Date.now() - timestamp.toDate().getTime()) / 86400000);
}
