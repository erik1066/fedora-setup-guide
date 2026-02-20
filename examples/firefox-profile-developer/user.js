// Blank startup page
user_pref("browser.startup.homepage", "chrome://browser/content/blanktab.html");

// Avoid containerizing data so site A cannot see site B's cookies, even without an extension; annoyance, will cause breakages for developers
user_pref("privacy.firstparty.isolate", false);

// Avoid OCSP hardening; will result in breakages/annoyances on a dev box
user_pref("security.OCSP.require", false);

// Avoid sanitize on close; will cause annoyances
user_pref("privacy.sanitize.sanitizeOnShutdown", false);

// Strict tracking protection
user_pref("privacy.trackingprotection.enabled", true);
user_pref("privacy.trackingprotection.socialtracking.enabled", true);

// Disallow attribution reporting submission behavior meant for ad measurement
user_pref("dom.private-attribution.submission.enabled", false);

// HTTPS-only mode
user_pref("dom.security.https_only_mode", true);

// Reduce DNS & speculative connections
user_pref("network.dns.disablePrefetch", true);
user_pref("network.prefetch-next", false);
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("network.predictor.enabled", false);

// Basic fingerprint resistance (safe for dev)
user_pref("privacy.resistFingerprinting", true);

// Disable telemetry
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("browser.ping-centre.telemetry", false);

// Harden link tracking
user_pref("privacy.query_stripping.enabled", true);
user_pref("privacy.query_stripping.enabled.pbmode", true);

// Clipboard hardening (non-breaking)
user_pref("dom.events.asyncClipboard.readText", false);
user_pref("dom.events.asyncClipboard.read", false);

// Keep WebGL enabled if doing Unity testing
user_pref("webgl.disabled", true);
user_pref("webgl.min_capability_mode", true);

// Keep WebRTC enabled (may be needed for dev tools)
// Set to false if not needed
// user_pref("media.peerconnection.enabled", false);

// Disable battery API
user_pref("dom.battery.enabled", false);

// Disable gamepad API
user_pref("dom.gamepad.enabled", false);

// Disable disk cache (optional strong privacy)
user_pref("browser.cache.disk.enable", false);

// DevTools safe settings
user_pref("devtools.debugger.remote-enabled", false);

// Strengthen TLS
user_pref("security.tls.enable_0rtt_data", false);

// Disable password saving (use Bitwarden instead)
// user_pref("signon.rememberSignons", false);

// Reject known trackers and partition all other third-party storage. Note that '5' should be the FF default in 2026, so this may be redundant.
user_pref("network.cookie.cookieBehavior", 5);

// Turn off geolocation features. Note, Google Maps may be less useful with this set to 'false'
user_pref("geo.enabled", false);