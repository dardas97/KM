// middleware.js  —  Vercel Edge Middleware
// Schützt NUR den Befundungsassistenten (/befundung.html) mit einem gemeinsamen Passwort.
// Läuft serverseitig, bevor die Seite ausgeliefert wird -> echter Schutz (nicht im Client umgehbar).
//
// EINRICHTUNG:
//  1. Diese Datei ins Wurzelverzeichnis deines Vercel-Projekts legen (neben package.json bzw. neben den HTML-Dateien).
//  2. In den Vercel-Projekteinstellungen -> Settings -> Environment Variables anlegen:
//        BEFUND_PASSWORD = dein-geheimes-team-passwort
//     (optional) BEFUND_USER = ein-benutzername   — wenn nicht gesetzt, wird der Benutzername ignoriert.
//  3. Neu deployen. Beim Aufruf von /befundung.html fragt der Browser Benutzer/Passwort ab.
//
// Nur der Befundungsassistent ist geschützt. Landing (index.html), km-index.html und die übrigen
// KM-Tools bleiben frei zugänglich.

export const config = {
  // Nur diese Pfade laufen durch die Middleware. Alles andere bleibt ungeschützt.
  matcher: ['/befundung.html', '/befundung'],
};

export default function middleware(request) {
  const PASSWORD = process.env.BEFUND_PASSWORD;
  const USER = process.env.BEFUND_USER || ''; // optional; leer = Benutzername egal

  // Falls kein Passwort konfiguriert ist: Seite sicherheitshalber NICHT ausliefern,
  // damit sie nicht versehentlich ungeschützt online steht.
  if (!PASSWORD) {
    return new Response(
      'Zugang nicht konfiguriert. Bitte Umgebungsvariable BEFUND_PASSWORD in den Vercel-Projekteinstellungen setzen.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const auth = request.headers.get('authorization') || '';

  if (auth.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(auth.slice(6)); // "user:pass"
    } catch (e) {
      decoded = '';
    }
    const idx = decoded.indexOf(':');
    const user = idx >= 0 ? decoded.slice(0, idx) : '';
    const pass = idx >= 0 ? decoded.slice(idx + 1) : '';

    const userOk = USER === '' ? true : safeEqual(user, USER);
    const passOk = safeEqual(pass, PASSWORD);

    if (userOk && passOk) {
      // Zugang gewährt -> Anfrage normal weiterreichen (Seite wird ausgeliefert).
      return; // undefined = weiterreichen
    }
  }

  // Kein oder falsches Passwort -> Browser-Anmeldedialog anfordern.
  return new Response('Zugang nur mit Passwort. Bitte anmelden.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CT-Befundungsassistent", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}

// Zeitkonstanter Vergleich, damit das Passwort nicht per Timing-Analyse erraten werden kann.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
