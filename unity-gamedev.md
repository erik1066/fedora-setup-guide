# Unity Game Development and Secure Configuration

First, we'll install Unity, Rider, Blender, and Zed. Avoid installing Unity, Blender, and Rider as Flatpaks.

The main threat vector we're protecting against is supply-chain attacks on the development tools themselves. If any of them are compromised, the following steps will ensure the blast radius is smaller than it would otherwise be.

## Create a new user account

By creating a dedicated, non-privileged user (e.g., `devuser`), you create a hard security boundary. 

If a malicious Unity asset or a compromised C# plugin tries to run `sudo`, it will fail because `devuser` isn't in the sudoers file.

You can use systemd or flatpak to "spawn" these apps as that user while they still appear on your current desktop.

```bash
# Create the user without adding them to the 'wheel' (sudo) group
sudo useradd -m devuser

# Set a password (only needed for the initial setup)
sudo passwd devuser
```

An example of how to run Zed as `devuser` is below. 

> Don't run anything yet, however. We're not done hardening the `devuser` account. The code below is just an example.

```bash
sudo systemd-run --user --machine=devuser@.host --scope \
    --property=NoNewPrivileges=yes \
    --property=RestrictAddressFamilies=none \
    --property=ProtectHome=read-only \
    /usr/bin/zed
```

- `--machine=devuser@.host`: Runs the command as `devuser`, a non-privileged account.
- `--scope`: Runs the command as a child of your current shell but managed by systemd.
- `RestrictAddressFamilies=none`: Completely disables all networking (IPv4, IPv6, etc.). The app will see "Network Unreachable."
- `NoNewPrivileges=yes`: The absolute "Anti-Sudo" flag. It prevents the process (and any of its children) from ever gaining new privileges via setuid binaries like sudo.
- `ProtectHome=read-only`: Prevents the tool from modifying your personal files, allowing it only to read them. 

> Understand that removing network access from Zed will prevent you from downloading extensions. Making `$HOME` read-only will prevent you from updating files in your home directory.

Since `devuser` and your current user account are separate, you'll need a shared directory that both accounts can see.

```bash
sudo mkdir /opt/projects
sudo chown devuser:devuser /opt/projects
sudo chmod 770 /opt/projects
# Add yourself to the devuser group to see the files
sudo usermod -aG devuser <yourusername>
```

> Replace `<yourusername>` with your actual username.


What the above steps have done:

- **Supply Chain Isolation:** If a malicious script in Rider tries to steal your SSH keys, it looks in /home/devuser/.ssh/ and finds nothing.
- **Process Isolation:** The malicious process cannot see or "pounce" on processes running under your main user account.
- **No Wipe Needed:** If you suspect an infection, you can simply `sudo userdel -r devuser` and recreate the environment in seconds.


Next, let's map `devuser` to SELinux's `user_u` role. By default, all users run as "unconfined" meaning, from SELinux's standpoint, they will have broad permissions if they ever gain root. By applying `user_u` to `devuser`, even if `devuser` gains root they will be unable to execute commands using `sudo`. This is a defense-in-depth that is layered on top of the methods we've taken thus far.

Apply the `user_u` role to `devuser`:

```bash
sudo semanage login -a -s user_u devuser
```

What `user_u` does:

- No Sudo: It is architecturally blocked from executing `setuid` applications like `sudo` or `su`, _even if the file permissions would normally allow it_.
- No Home Execution: It can be configured to prevent executing any binaries inside its own home directory, which stops "hidden" malware from running.

All we've done so far is set up `devuser` and lock it down. We now need to install our IDEs and other tools.

## Install Unity

Since Unity is only officially supported on Ubuntu, we may want to avoid installing it directly into the host system. We can instead use Toolbox to create an Ubuntu container for managing Unity's required dependencies. This will help avoid breakage.

First, install Toolbox, if not already present:

```bash
sudo dnf install toolbox
```

Now **log in as `devuser`**. This is a critical step. 

List all toolboxes and verify you don't already have one called `unity-env`.

```bash
toolbox list
```

> You can remove a toolbox by running `toolbox rm <container-name>`. Toolbox uses Podman under-the-hood, so you can also see toolboxes by running `podman ps -a`.

Next, as `devuser`, create a container based on Ubuntu LTS using the command below. The `unity-env` in the command is the name of the toolbox.

```bash
toolbox create --distro ubuntu --release 24.04 unity-env
```

Enter the container:

```bash
toolbox enter unity-env
```

Once inside, update the package list and install the libraries Unity Hub needs:

```bash
sudo apt update && sudo apt install libnss3 libnss3-tools libasound2 libsecret-1-0 libgtk-3-0 libgconf-2-4 libarchive13 libssl1.1
```

Go to https://unity.com/download and get the latest AppImage.

Inside the container, make it executable and run it: 

```bash
chmod +x UnityHub.AppImage
./UnityHub.AppImage --no-sandbox 
```

Now, as your **main user** (not `devuser`), run this command:

```bash
xhost +SI:localuser:devuser
```

This ensures running a GUI app as a different user can still connect to your Wayland session by default. That is, we needed to grant `devuser` permission to access our display. The above command does that.


Next, run Unity using the command below. 

> You can run this command as your regular user account; you don't need to be logged in as `devuser` any more. The `machine=devuser@.host` takes care of setting the user context.

```bash
systemd-run --machine=devuser@.host --user --scope --unit=unity-editor \
    --property=RestrictAddressFamilies="AF_INET AF_INET6 AF_UNIX" \
    --property=NoNewPrivileges=yes \
    --setenv=DISPLAY=$DISPLAY \
    --setenv=XDG_RUNTIME_DIR=/run/user/$(id -u devuser) \
    toolbox run --container unity-env \
    /home/devuser/path/to/unity-hub --no-sandbox
```
Note that we want to avoid setting `ProtectHome=read-only` for Unity. It's a `$HOME`-heavy app that needs to write config files in your home folder. Setting this property will break stuff, in other words. 


Create a new file at `~/.local/share/applications/unity-dev.desktop` with the following content. This configuration explicitly sets the environment variables required for a cross-user GUI to function.

```ini
[Desktop Entry]
Name=Unity (Dev User)
Comment=Run Unity Hub as devuser via Toolbx
# Use absolute paths for everything
Exec=systemd-run --machine=devuser@.host --user --scope --unit=unity-hub \
    --property=RestrictAddressFamilies="AF_INET AF_INET6 AF_UNIX" \
    --property=NoNewPrivileges=yes \
    --setenv=DISPLAY=:0 \
    --setenv=XDG_RUNTIME_DIR=/run/user/1001 \
    toolbox run --container unity-env /home/devuser/UnityHub.AppImage --no-sandbox
Icon=unityhub
Type=Application
Terminal=false
Categories=Development;
```

> Replace `1001` with the actual UID of `devuser` (found by running `id -u devuser`) and update the AppImage path,

**Critical Troubleshooting for COSMIC**

- The `XDG_RUNTIME_DIR`: This is the most common point of failure. `devuser` needs its own runtime directory to be active. Ensure you have enabled lingering for that user (`sudo loginctl enable-linger devuser`) or the directory may not exist.
- Address Families: `AF_UNIX` is included in the `RestrictAddressFamilies` property. This is mandatory because Unity Hub and the Editor communicate via local Unix sockets.
- Authentication: When you click the shortcut, COSMIC will likely trigger a Polkit password prompt. You must enter your main user's password (if you have `sudo` rights) to authorize the cross-user `systemd-run` action.
- Refresh Menu: If the icon doesn't appear in the COSMIC app list immediately, run `update-desktop-database ~/.local/share/applications`. 

