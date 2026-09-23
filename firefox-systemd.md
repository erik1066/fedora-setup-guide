# Firefox Systemd Hardening Guide

Run:

```bash
mkdir -p ~/.local/bin
nano ~/.local/bin/firefox-hardened
```

Paste this into the file in Nano:

```bash
#!/usr/bin/env bash

exec systemd-run --user \
  --unit=firefox-hardened \
  --collect \
  --property=Type=exec \
  --property=NoNewPrivileges=yes \
  --property=PrivateTmp=yes \
  --property=RestrictSUIDSGID=yes \
  --property=ProtectHostname=yes \
  /usr/bin/firefox "$@"
```

Then:

```bash
chmod 700 ~/.local/bin/firefox-hardened
```

We can run `firefox-hardened` from the terminal now. Let's also ensure this runs when the Firefox icon is clicked on the dock.


Run:

```bash
cp /usr/share/applications/org.mozilla.firefox.desktop ~/.local/share/applications/org.mozilla.firefox.desktop
```

Then:

```bash
nano ~/.local/share/applications/org.mozilla.firefox.desktop
```

Then find the `Exec=` lines. 

Firefox's desktop file generally contains several because it has normal-window, private-window and other actions.

Replace `/usr/bin/firefox` or `firefox` in those lines with:

```
/home/devuser/.local/bin/firefox-hardened
```

Leave these alone:

```ini
Name=Firefox
Icon=firefox
StartupWMClass=firefox
```

Refresh the desktop entry database:

```bash
update-desktop-database ~/.local/share/applications
```

Now quit Firefox fully.

Click the Firefox icon.

Verify it works:

```bash
systemctl --user show firefox-hardened.service \
  -p NoNewPrivileges
```

You should see `NoNewPrivileges=yes`.