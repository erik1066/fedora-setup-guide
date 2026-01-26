# Remote Server Setup for Executing code

There are situations where you want to avoid running code, including code from 3rd party libraries, on your Fedora workstation. Untrusted code could access your Home directory and present risks to your host system. 

To mitigate this, we can instead build and run our code on a remote machine. We could do this with devcontainers, but a stronger option is to use an actual Fedora Server virtual machine with extra hardening applied to it.

The idea is to use IDEs, let Visual Studio Code, IntelliJ IDEA, Zed, Rider, GoLand, etc. as 'thin clinets' that are installed as Flatpaks, putting them into restricted sandboxes on your workstation; meanwhile, the code they touch is all running remotely in a VM. Any malicious code will thus run in the context of the VM with no access to your base system.

## Install JetBrains products

Remote code execution means that we do not run any toolchains or builds on the host system. Instead, we will use a virtual machine or another server we have access to for building and running code. We'll furthermore harden the JetBrains installation itself by installing them as Flatpaks.

### Step 1: Install JetBrains IDEs

```bash
flatpak install flathub com.jetbrains.Rider
flatpak install flathub com.jetbrains.GoLand
flatpak install flathub com.jetbrains.WebStorm
flatpak install flathub com.jetbrains.RustRover
flatpak install flathub com.jetbrains.DataGrip
```

Let's proceed with Rider as an example. It's a good idea to restrict IDEs like these to only see what you want them to see on the local filesystem. Assuming we have our source code located in `~/dev/source`, we can lock down the IDE to just that folder:

### Step 2: Configure IDEs with restrictive permissions to the filesystem
```bash
flatpak override --user \                                                                                          !2069
  --nofilesystem=home \
  --filesystem=$HOME/dev/source \
  com.jetbrains.Rider
```

Let's also ensure that Rider can talk to the SSH agent socket. This is important later when we want to do SSH forwarding.

```bash
flatpak override --user --filesystem=xdg-run/ssh-auth com.jetbrains.Rider
flatpak override --user --filesystem=xdg-run/gcr com.jetbrains.Rider
```

Verify:

```bash
flatpak override --user --show com.jetbrains.Rider
```

Expected output:

```
[Context]
filesystems=!home;/home/user/dev/source;
```

Result:
* Rider cannot read the home directory
* Rider can only see `~/dev/source`
* Rider cannot crawl `~/.ssh` or `~/.config`

Now, when opening Rider, you will be prompted with this question: "Trust and Open 'ide-flatpak-wrapper' Directory?" 

Answer **Don't open**. You're unlikely to be developing the Flatpak wrapper and so you don't need Rider to index it or run anything from this folder. Trusting and opening it just increases attack surface for no gain.

Only trust directories that contain your own source code.

If Rider subsequently crashes after selecting **Don't open**, just restart Rider and it should work fine.

We've just set up the IDEs, meaning the clients, but they're unable to see local binaries. We'll solve this next.

## Set up the Virtual Machine

### Step 1: Create a new Virtual Machine

If you followed the [Fedora Setup Guide](README.md), you already have Virtual Machine Manager installed and know how to set a new VM using Fedora's "out-of-the-box" virtualization experience. You would have done that by running these commands or similar ones:

```bash
sudo dnf install @virtualization virt-manager libvirt-daemon-kvm
sudo systemctl enable --now libvirtd
```

If you did need to run the above commands then be sure to log out and log in again so your user joins `libvirtd`.

Next, create a Fedora Server virtual machine using **virt-manager** (the GUI app).

* **OS**: Fedora Server
* **CPU**: 4 Cores
* **RAM**: 8-16 GB
* **Disk**: 40-80 GB
* **Networking**: NAT (default)

Inside virt-manager:
* Disable USB passthrough
* No clipboard sharing
* No shared folders (we'll use SSH and git instead)
* No GPU passthrough

This ensures no direct host filesystem access.

Name the VM "fedora-devvm" or another name you can easily identify.

You'll get a GUI for installing Fedora Server. Keep the default setting of having no root user. For the other user account it asks you to create during install, use a name that encodes risk and role together, like `devexc`. This name will appear in `ssh user@host` and in logs. Being easy to type might be another perk.

Username examples:

* `devexc` (though harder to type quickly)
* `build`
* `sandbox`
* `coderun`
* `executor`
* `runner`

We want a psychological boundary as well as a technical one with our use of names. This means avoiding re-use of our current username(s). We'll go with `devexec` since it implies this is a development machine used to build and run code.

You can optionally navigate to **Software Selection** on the installation options screen and uncheck **Domain Membership**, since this VM won't be joining any domains. Adding unnecessary bloat only increases attack surface and blast radius.

### Step 2: Harden the VM

#### Update OS

Update the OS and reboot:

```bash
sudo dnf update -y
sudo reboot
```

#### Lock down SSH 

Now let's lock down SSH.

```bash
sudo vim /etc/ssh/sshd_config
```

Add these if not present:

```
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

AllowUsers devexec
X11Forwarding no
AllowAgentForwarding yes
AllowTcpForwarding yes
```

Remember that `:w` saves the file and `:q` quits vim.

Restart SSH:

```bash
sudo systemctl restart sshd
```

#### Disable services

Disable Bluetooth service:

```bash
sudo systemctl disable --now bluetooth
```

#### Configure the firewall

Set the default firewall zone to `public`, allow SSH traffic, and reload the firewall service:

```bash
sudo firewall-cmd --set-default-zone=public
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

You may get an error trying to add SSH that it's already enabled.

Verify that no other services are exposed:

```bash
sudo firewall-cmd --list-all
```

#### Lock down Home permissions

Lock down home permissions:

```bash
chmod 700 /home/devexec
```

#### File system hygiene

Let's also noexec on `/tmp`. Remember that `/tmp` is world-writable and used by every user, service, and daemon. It's frequently used to store downloaded files, temp scripts, unpacked archives, etc. 

From an attacker's perspective, it's writable without privileges, always present, and almost never locked down, making it an ideal staging area.

```bash
sudo vim /etc/fstab
```

Add these lines:

```
tmpfs /tmp tmpfs defaults,noexec,nosuid,nodev 0 0
tmpfs /var/tmp tmpfs defaults,nosuid,nodev 0 0
tmpfs /dev/shm tmpfs defaults,noexec,nosuid,nodev 0 0
/home ext4 defaults,nosuid,nodev 0 2
```

> We're keeping execution in `var/tmp` because this is a VM for executing code remotely; some build systems may rely on this.

Next:

```bash
sudo systemctl daemon-reload
sudo mount -o remount /tmp
```

This last line tells systemd to re-read `/etc/fstab`, unit files (`.service`, `.mount`, `.socket`), regenerate mount units, and update its internal dependency graph.

Let's verify:

```bash
mount | grep ' /tmp '
```

Expected output:

```
tmpfs on /tmp type tmpfs (rw,nosuid,nodev,noexec,seclabel,nr_inodes=1048576,inode64,usrquota)
```

`rw` means read/write enabled, which is required for normal operation. `nosuid` means SetUID and SetGID bits are ignored, which blocks some privilege escalation trickery. `nodev` means device files are forbidden, blocking attackers from creating fake block/character devices. `noexec` means direct execution from `/tmp` is blocked and the kernel will refuse `execve()` on files here. `seclabel` means SELinux labels are enforced on this file system and get the correct `tmp_t` context, i.e. SELinux is now stacked on top of the mount hardening we just did. The `nr_inodes=1048576` means `/tmp` can create up to ~1 million files, and prevents inode exhaustion attacks; a good kernel-level DoS mitigation.

We will not over-harden `/boot` or `/usr` given how this VM will be used.

#### Disable credential persistence

If we don't need long-lived creds in the VM:

```bash
sudo dnf remove -y gnome-keyring
```

#### Enable automatic security updates

```bash
sudo dnf install -y dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

### Step 3: Snapshot the VM

Turn off the VM by running `shutdown` and then make a snapshot in virt-manager. Call this something like `clean-baseline`. If anything ever feels off, you can always blow away the current state and revert back to this known-good baseline.

> Be sure the VM is in the shutdown state before taking a snapshot.

### Step 4: SSH into the VM

On the **host** system, let's find the IP address of the VM we just created. You can do this by going into the running VM in virt-manager and looking at its `eth0` device.

Now, we need to turn on password authentication in the VM in order to transfer our SSH key to the VM. Recall that we disabled password-based auth in the steps above. Let's temporarily disable this:

```bash
sudo vim /etc/ssh/sshd_config
```

Set:

```conf
PasswordAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

On the host system:

```bash
ssh-copy-id devexec@192.168.x.x
```

Fill in the actual IP address of the VM in place of the `x`'s above.

Expected output:

```
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: ssh-add -L
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
devexec@192.168.x.x's password:

Number of key(s) added: 1

Now try logging into the machine, with: "ssh 'devexec@192.168.x.x'"
and check to make sure that only the key(s) you wanted were added.
```

Lock SSH back down:

```bash
sudo vim /etc/ssh/sshd_config
```

Set:

```conf
PasswordAuthentication no
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

Done, with no need for clipboard access. Note you _can_ manually type the key as well if you really don't want to enable password-based auth, even temporarily.

Let's shut the machine down and snapshot again.

### Step 5: Install Basic Tools on the VM

To recap, we're aiming to run the JetBrains IDE UIs on the _host_ while the JetBrains backend + indexing + builds run on the _guest_, meaning the virtual machine. Code stays on the guest, too.

First, in the VM (as `devexec`), let's create a clean workspace layout:

```bash
mkdir -p ~/work/{dotnet,go,js}
mkdir -p ~/.local/bin
chmod 700 ~/work
```

We will keep repos under `~/work/...` so it's easy to snapshot and backup, and easy to constrain later if needed.

Next, let's install some common tools we'll need:

```bash
sudo dnf update -y

sudo dnf install -y \
  git curl wget unzip tar \
  ca-certificates \
  openssh-clients \
  gcc gcc-c++ make \
  cmake ninja-build \
  clang lldb gdb \
  pkgconf-pkg-config \
  openssl-devel zlib-devel bzip2-devel xz-devel \
  libicu-devel krb5-devel
```

### Step 6: Install .NET SDK

It's critical that before installing and running .NET, we set two important environment variables. The first ops out of telemetry and the other disables first-run experiences. Neither are useful in the context of a remote code VM.

Either SSH into the VM or use virt-manager to run:

```bash
sudo vim /etc/profile.d/dotnet.sh
```

Add these two lines:

```bash
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
```

Save and exit.

Now reload:

```bash
source /etc/profile
```
Let's install .NET for Rider:

```bash
sudo dnf install -y dotnet-sdk-10.0
```

Verify:

```bash
dotnet --info
```

If you plan to use Entity Framework then:

```bash
dotnet tool install --global dotnet-ef
```

Now ensure .NET tools are in PATH:

```bash
echo 'export PATH="$HOME/.dotnet/tools:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Step 7: Install Go for GoLand

```bash
sudo dnf install -y golang
```

Verify:

```bash
go version
```

Install common Go tooling:

```bash
go install golang.org/x/tools/gopls@latest
go install honnef.co/go/tools/cmd/staticcheck@latest
```

Make sure `~/.local/bin` and `~/go/bin` are on PATH. If not, add:

```bash
echo 'export PATH="$HOME/go/bin:$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Step 8: Install Node.js for WebStorm

```bash
sudo dnf install -y nodejs npm
```

Install common JS package managers:

```bash
sudo npm install -g pnpm yarn
```

Verify:

```bash
node -v
npm -v
pnpm -v
```

### Step 9: Make SSH settings compatible with JetBrains remote development

Let's ensure SSH configuration allows us to use JetBrains remote development:

```bash
sudo vim /etc/ssh/sshd_config
```

Ensure these are all "yes":

```conf
AllowTcpForwarding yes
AllowAgentForwarding yes
```

You should have already set these if you've been following the guide. Otherwise, set them now, save the file, and restart:

```bash
sudo systemctl restart sshd
```

### Step 10: Create IDE-only SSH keys

JetBrains products, when installed as Flatpaks, cannot 'see' your `~/.ssh` directory the way we've configured them. This is a problem, because we configured the VM to only accept key-based SSH authentication.

Let's create new SSH keys in a directory JetBrains can pick them up from. Do these on the **host**:

```bash
mkdir -p ~/dev/keys
chmod 700 ~/dev/keys

# create a dedicated key pair just for this VM (recommended)
ssh-keygen -t ed25519 -a 64 -f ~/dev/keys/dev-sandbox_ed25519
chmod 600 ~/dev/keys/dev-sandbox_ed25519
```

Now we need to authorize the public key on the VM:

```bash
ssh devexec@192.168.x.x 'mkdir -p ~/.ssh && chmod 700 ~/.ssh'
ssh devexec@192.168.x.x 'cat >> ~/.ssh/authorized_keys' < ~/dev/keys/dev-sandbox_ed25519.pub
ssh devexec@192.168.x.x 'chmod 600 ~/.ssh/authorized_keys'
```

Now, make sure Rider has access to only that key directory:

```bash
flatpak override --user \
  --filesystem=$HOME/dev/keys:ro \
  com.jetbrains.Rider
  ```

Repeat this command for all other JetBrains IDEs you wish to use, replacing "com.jetbrains.Rider" with the appropriate product name.

### Step 11: Use from within Rider/GoLand/WebStorm etc.

Open Rider. On the startup window, select **Remote Development** > **SSH**.

Rider might ask you for a private key; navigate to `dev/keys` and select the key you just created: `~/dev/keys/dev-sandbox_ed25519.pub`.

This should succeed and present you with a Rider window showing "devexec@192.168.x.x" and explaining "Host has no projects."

### Step 12: Get code into the VM

In an earlier step you should have created a directory called `~/work/dotnet` on the virtal machine. If you haven't done this yet, do this now:

```bash
mkdir -p ~/work/dotnet
chmod 700 ~/work
```

Let's clone a repo:

```bash
cd ~/work/dotnet
git clone https://github.com/<org>/<repo>.git
```

If it’s private, you can use a PAT when prompted.

Now, back in Rider, under "devexec@192.168.x.x" on the landing page, select **Open Project**. Navigate to the `.sln` file in the cloned repository where Rider asks for a Solution File. Then, select **Download IDE and Connect**.

You should see a "Downloading the IDE backend on the remote host" with a progress meter. Wait a while for this to finish.

When it's done downloading the IDE, click through any prompts and then wait for the solution to be indexed.

### Step 13: SSH Keys for pushing commits

If you've followed the steps (and only these steps) exactly, you have no SSH keys on the VM. Verify:

```bash
ls -al ~/.ssh
```

We don't want to add SSH keys to the VM, as this defeats part of the reason for having a development VM in the first place. We can instead use SSH key forwarding. This assumes you already have SSH keys on your host that you use for GitHub. (If not, create that now).

On the **host** machine, start the SSH agent:

```bash
eval "$(ssh-agent -s)"
```

Check if anything is loaded:

```bash
ssh-add -l
```

Expected output is "The agent has no identities."

Add your current key:

```bash
ssh-add ~/.ssh/id_ed25519
```

Verify:

```bash
ssh-add -l
```

Let's set up the host to enable agent forwarding:

```bash
nano ~/.ssh/config
```

Add the following:

```
Host dev-sandbox
    HostName 192.168.x.x  # VM's IP address
    User devexec
    IdentityFile ~/.ssh/id_ed25519  # Path to your private key
    ForwardAgent yes  # Enable agent forwarding
```

Now, remote into the VM:

```bash
ssh devexec@192.168.122.57
```

Let's persist agent forwarding across SSH sessions:

```bash
vim ~/.bashrc
```

Add:

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)"
fi
```

Now source it:

```bash
source ~/.bashrc
logout
```

Let's log in again:

Now, remote into the VM:

```bash
ssh -A devexec@192.168.122.57
```

The `-A` flag explicitly enables agent forwarding. This tells the SSH client on the host to forward the private key to the VM.

Verify whether the agent is forwarded:

```bash
ssh-add -l
```

You should see success here with the right identity returned from the `ssh-add` command.

You've now set up an SSH key that the VM can use, but where the VM never sees the private key. Malicious code that runs on the VM will struggle to steal the key given what we've just done.



If you see emptiness here, then you need to create a new SSH key for pushing commits. Let's do this now.

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519
```

Now get the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Go to GitHub.com and log in. Click on your Profile Picture and select **Settings** > **SSH and GPG Keys**. Click New SSH Key, and paste your public key in the form.

## Fix Fedora Disk Volume Limitations

The root logical volume (fedora-root) is probably much smaller than the disk you allocated in virt-manager. For instance, if you allocated 80 GB, you may only 'see' 15 GB, as well your IDEs like Rider. 

For Rider, this is a problem, as it's disk-hungry and will complain if there's insufficient space. 15 GB will go fast.

First, check to see how much disk space you actually have:

```bash
df -h
```

Example output:

```
Filesystem                          Size  Used Avail Use% 
Mounted on/dev/mapper/fedora-root   15G   15G  350M  98% /devtmpfs
...
```

If you allocated 80G but see substantially less than that in the output, then we're in the below situation:

```
[ 80 GB virtual disk ]
        |
        v
[ Volume Group: fedora ]
   ├── fedora-root   (15 GB)  ← full
   ├── fedora-swap   (some GB)
   └── FREE SPACE    (~60+ GB)  ← unused
```

You should take the following steps to expand the disk volume. 

> This guide assumes you are using this VM for purely development purposes; reconsider the commands below if you're using this VM more like a server.

**Step 1:** Confirm disk space actually exists

```bash
sudo vgs
```

You should see something like:

```
VG     #PV #LV #SN Attr   VSize   VFree  
fedora   1   1   0 wz--n- <78.00g <63.00g
```

Look specifically for a large `VFree` value.

**Step 2:** Expand the root logical volume (use all free space)

```bash
sudo lvextend -l +100%FREE /dev/mapper/fedora-root
```

This only changes the LV size, not the filesystem. 

**Step 3:** Grow the filesystem

Fedora Server uses XFS by default. Grow it:

```bash
sudo xfs_growfs /
```

No rebooting is needed.

**Step 4:** Verify

```bash
df -h /
```

Now you might see something like this:

```
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/fedora-root   78G   16G   63G  21% /
```

Success. Notice the use% and availabile columns.


## Remote Web Debugging

We need additional steps to debug web applications, such as ASP.NET or Blazor apps (to follow along with our use of Rider as the example IDE to set up), on the **host** machine. In other words, we want to build, debug, and run the web app in the virtual machine but debug on the host machine using the browser of our choice. Let's set that up now.

We're going to run run Kestrel bound to loopback in the VM:

```bash
export ASPNETCORE_URLS="http://127.0.0.1:5000"
dotnet run
```

Now on the host:

```bash
ssh -N -L 5000:127.0.0.1:5000 devexec@192.168.124.188
```

Now just open `http://localhost:5000` in Firefox. Rider (the IDE) debugs .NET while Firefox devtools work on the client. This is a clean split and works great for ASP.NET MVC.

## OpenAI Codex Integration with Rider

Let's install Codex. Now, `npm install -g @openai/codex` is unlikely to work given our setup, so we need to take a different track. Let's use npm’s per-user "global" directory:

```bash
# Create a user-global npm prefix
mkdir -p ~/.local/share/npm-global

# Tell npm to use it for global installs
npm config set prefix "$HOME/.local/share/npm-global"

# Put its bin directory on your PATH (bash/zsh)
echo 'export PATH="$HOME/.local/share/npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Codex CLI
npm install -g @openai/codex

# Sanity check
which codex
codex --version
```

Done.
