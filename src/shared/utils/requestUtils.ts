export function getCharacterId(event: any): number | null {
  const param = event.queryStringParameters?.characterId;
  if (!param) return null;
  const id = Number(param);
  if (isNaN(id) || id <= 0) return null;
  return id;
}

export function getLimit(event: any, defaultValue = 10): number {
  const param = event.queryStringParameters?.limit;
  const limit = Number(param);
  if (!param || isNaN(limit) || limit <= 0) return defaultValue;
  return limit;
}

export function getLastKey(event: any): Record<string, any> | undefined {
  const param = event.queryStringParameters?.lastKey;
  if (!param) return undefined;
  try {
    const decoded = JSON.parse(decodeURIComponent(param));
    if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
      return decoded;
    }
    return undefined;
  } catch {
    return undefined;
  }
} 