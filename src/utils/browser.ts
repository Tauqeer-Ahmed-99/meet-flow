export type BrowserName =
  | "Edge"
  | "Opera"
  | "Chrome"
  | "Safari"
  | "Firefox"
  | "IE"
  | "Unknown";

export function getBrowserName(): BrowserName {
  const userAgent = navigator.userAgent;

  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\//.test(userAgent)) return "Opera";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/MSIE|Trident\//.test(userAgent)) return "IE";
  return "Unknown";
}
