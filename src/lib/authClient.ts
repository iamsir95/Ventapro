export async function getSession() {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    const session = await res.json();
    return Object.keys(session).length > 0 ? session : null;
  } catch (err) {
    return null;
  }
}

export async function getCsrfToken() {
  try {
    const res = await fetch("/api/auth/csrf");
    const data = await res.json();
    return data.csrfToken;
  } catch (err) {
    return "";
  }
}

export async function signIn(provider: string, options?: any) {
  if (provider === "credentials") {
    const csrfToken = await getCsrfToken();
    return fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        ...options,
        csrfToken,
        redirect: 'false',
      }),
    });
  } else {
    // For OAuth popups in iframe environments
    window.open(`/api/auth/signin/${provider}`, 'AuthPopup', 'width=500,height=600');
  }
}

export async function signOut() {
  const csrfToken = await getCsrfToken();
  return fetch("/api/auth/signout", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, redirect: 'false' })
  }).then(() => {
    // Force a full reload to clear state and re-fetch session
    window.location.href = '/'; 
  });
}
