// Shared Upstash Redis REST API Helper (Zero-dependency fetch)
export async function queryRedis(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null; // Signals missing environment variables
  }

  const endpoint = `${url.replace(/\/+$/, '')}/pipeline`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  if (!response.ok) {
    throw new Error(`Upstash Redis HTTP Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
