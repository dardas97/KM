# Passwortschutz für den Befundungsassistenten (Vercel)

Diese Anleitung schützt **nur** den Befundungsassistenten (`befundung.html`) mit einem
gemeinsamen Team-Passwort. Die Landing-Seite, die KM-Tools-Übersicht und die übrigen
KM-Tools bleiben frei zugänglich.

Der Schutz läuft über **Vercel Edge Middleware** — das Passwort wird auf dem Server
geprüft, bevor die Seite ausgeliefert wird. Das ist echter Schutz: Der Seiteninhalt
kommt gar nicht erst zum Browser, solange man nicht angemeldet ist. Funktioniert auf
dem kostenlosen Vercel-Plan.

## Was du brauchst

- Deine bestehende Website auf Vercel
- Die Datei `middleware.js` (liegt bei)
- Die Dateien der CT-Tools (aus dem Zip), inklusive `befundung.html`

## Schritt für Schritt

### 1. Dateien ins Projekt legen
Lege `middleware.js` ins **Wurzelverzeichnis** deines Vercel-Projekts — also dorthin,
wo auch deine anderen Dateien / deine `package.json` liegen. Wichtig: nicht in einen
Unterordner, sonst greift die Middleware nicht.

Lege die HTML-Dateien der CT-Tools so ab, dass `befundung.html` unter der Adresse
`deine-domain.de/befundung.html` erreichbar ist.

### 2. Passwort als Umgebungsvariable setzen
Im Vercel-Dashboard:

  Projekt öffnen → **Settings** → **Environment Variables** → **Add New**

  - **Key:**  `BEFUND_PASSWORD`
  - **Value:** dein geheimes Team-Passwort
  - **Environments:** Production (und Preview, falls gewünscht)

  → **Save**

Optional, falls du zusätzlich einen Benutzernamen abfragen willst:
  - **Key:** `BEFUND_USER`  **Value:** z. B. `radiologie`
  (Ohne diese Variable wird der Benutzername ignoriert — es zählt nur das Passwort.)

**Wichtig:** Das Passwort steht damit NICHT im Code, sondern nur in den geschützten
Projekteinstellungen. So kann es niemand aus den Dateien auslesen.

### 3. Neu deployen
Nach dem Setzen der Variable einmal neu deployen (z. B. per Git-Push oder im Dashboard
„Redeploy"), damit die Middleware und die Variable aktiv werden.

### 4. Fertig — Test
Rufe `deine-domain.de/befundung.html` auf:
- Es erscheint ein **Anmeldedialog** des Browsers.
- Benutzername leer lassen (oder den gesetzten `BEFUND_USER`), Passwort eingeben.
- Nach korrekter Eingabe wird der Befundungsassistent geladen.
- Die übrigen Seiten (Landing, KM-Tools) sind weiterhin ohne Passwort erreichbar.

## Passwort ändern
Einfach den Wert von `BEFUND_PASSWORD` in den Environment Variables ändern und neu
deployen. Beim nächsten Aufruf gilt das neue Passwort.

## Was dieser Schutz leistet — und was nicht

**Leistet:** Der Seiteninhalt wird erst nach korrektem Passwort ausgeliefert. Wer das
Passwort nicht hat, sieht nur den Anmeldedialog — nicht den Quellcode oder die Inhalte.
Für „nur bestimmte Leute im Team sollen rankommen" ist das genau richtig.

**Nicht:** Es ist ein **gemeinsames** Passwort, keine individuelle Benutzerverwaltung.
Jeder, der das Passwort kennt, kommt rein; du siehst nicht, wer sich anmeldet, und
kannst nicht einzelne Personen gezielt sperren. Falls du später einzelne Personen
per E-Mail freischalten oder Zugriffe protokollieren willst, wäre Cloudflare Access
(kostenlos bis 50 Nutzer) oder ein echtes Login-Backend der nächste Schritt.

**Hinweis Basic Auth:** Der Browser merkt sich die Anmeldung bis zum Schließen des
Fensters. Zum „Abmelden" muss das Browserfenster geschlossen werden. Nutze die Seite
nur über **HTTPS** (bei Vercel Standard), damit das Passwort verschlüsselt übertragen
wird.

## Datenschutz-Hinweis
Bei einem klinischen Tool mit möglichem Patientenbezug: Gib keine Patientendaten ein,
die nicht ohnehin ins RIS übernommen werden. Für den dienstlichen Einsatz kläre die
Nutzung mit deiner IT-/Datenschutzabteilung ab.
