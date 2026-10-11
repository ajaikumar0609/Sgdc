// Shasthi Guru Dream Campus - Frontend API Client

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use relative path through Next.js rewrite proxy
    return '';
  }
  // Server-side: use internal Express API port (5001) or environment URL
  return process.env.INTERNAL_API_URL || 'http://localhost:5001';
};

export async function fetchFromApi<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string; fields?: Record<string, string> } }> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      next: { revalidate: 30 }, // Cache for 30s in production
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    // Graceful error capture during build-time or network interruptions
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Unable to connect to the Shasthi Guru platform services.',
      },
    };
  }
}
