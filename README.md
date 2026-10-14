# WMR Writing Mentor 1.0

WMR is a local-first IELTS Writing workspace with a draft editor, offline task bank, targeted tutor tools, evidence-checked AI assessment, a detailed report and private progress tracking.

## Offline-first and privacy

- Drafts, tasks, local checks, report history, learning summaries and theme settings work without an Internet connection.
- AI is disabled by default. The explicit provider permission toggle must be enabled before a draft or tutor context is sent to a configured endpoint.
- Desktop API keys stay in process memory and must be entered again after restarting WMR.
- Android uses Android Keystore-backed secure storage for the provider key.
- No accounts or cloud sync are implemented. The desktop runtime binds to loopback only.
- If no AI provider is enabled, WMR gives local structural checks and does not invent a band estimate.
- The tutor has no shell, arbitrary file access or browser automation tool. Student essay text is treated as untrusted input.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm test
npm run check
npm run build:web
npm start
```

Open http://127.0.0.1:4179. The server must not be exposed to a LAN, reverse proxy or public network.

## Multiple AI providers

Settings includes OpenAI, Anthropic, Google Gemini, OpenRouter, DeepSeek, Groq, Together AI, Mistral, Ollama, LM Studio and custom OpenAI-compatible endpoints.

Select the exact model identifier supported by your account. Hosted providers require current input and output prices to be entered explicitly in USD per million tokens before WMR enables costed requests. WMR does not guess prices. Local loopback HTTP is allowed only for local model servers. Desktop credentials are not returned by settings endpoints or written to configuration files.

On Android, 127.0.0.1 refers to the Android device itself, not the desktop computer where Ollama may be running. Use an HTTPS endpoint reachable by the device only when you intentionally opt in to external transmission.

## Assessment report

Press **Nộp bài & chấm sâu**. Local preflight is shown immediately; a model assessment runs only when provider access is enabled and the provider is configured. The report contains four rubric criteria, evidence quotes that must match the essay, severity-ranked issues, targeted fixes, strengths and next-step priorities.

The displayed band estimate is formative and uncalibrated, not an official IELTS score. A matching quotation does not prove that every explanation is true. Before claiming accuracy, WMR needs an independent dataset of expert-rated essays and evaluation by criterion.

## GitHub Actions release

The CI workflow runs tests and builds the web application on Node 22 and 24. The release workflow builds these x64 artifacts after a push to main:

- Windows: NSIS installer and portable executable.
- Linux: AppImage and Debian package.
- Android: installable debug-signed APK and Android App Bundle.

Only after all three jobs finish successfully does Actions publish a GitHub prerelease. The debug APK is for sideloading/testing; the unsigned AAB is not Play Store-ready. A production Android release still needs maintainer-controlled signing configuration and a protected upload key.

## Known limitations

This initial cross-platform foundation is not yet a claim of production certification. The starter task bank is intentionally small; assessment is not calibrated against independent examiner-rated data; the complete original v0.9 knowledge corpus is not included in this repo bootstrap; and real-device behavior, accessibility, screenshots, model-provider interoperability and release signatures must be verified before claiming they all work.
