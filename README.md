# Fedora 40 Setup Guide

This repository contains instructions to set up Fedora 40 Workstation for developing software in Go, Rust, C# (.NET Core), Java, and other languages. 

> See [Pop!_OS Setup Guide](https://github.com/erik1066/pop-os-setup) for a version of this guide specific to Pop!_OS and Ubuntu.

## Update the OS and install common tools

The first thing you should do is update Fedora:

```bash
sudo dnf upgrade
```

Reboot the system.

Upon logging in again, check for device firmware updates and install those updates by running the following commands:

```bash
fwupdmgr refresh --force
fwupdmgr get-updates
fwupdmgr update
```

Let's next install some common development tools:

```bash
sudo dnf -y install make
```

## Install Gnome Tweaks

Install Gnome Tweaks:

```bash
sudo dnf -y install gnome-tweaks
```

Gnome Tweaks will let you add minimize and maximize buttons to windows, change fonts, modify font rendering behavior, and alter the appearance of the UI.

## Install Tilix

Tilix may be preferable to the default Gnome terminal:

```bash
sudo dnf install tilix
```

## Z Shell (ZSH)

**Instructions derived from https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH on 2024-09-02**

[ZSH](https://en.wikipedia.org/wiki/Z_shell) can be installed by running:

```bash
sudo dnf install zsh
```

Run `zsh --version` and look for `zsh 5.9 (x86_64-redhat-linux-gnu)` (or newer) to verify success

To set `zsh` as the default shell, run:

```bash
chsh -s $(which zsh)
```

Start a new session. ZSH is now your default shell.

### Optional: Install Oh-My-ZSH for ZSH configuration management
[Oh-My-ZSH](https://github.com/ohmyzsh/ohmyzsh) is an excellent tool for managing your ZSH configuration. Install it using the following command:

```bash
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

An "Oh My Zsh!... is now installed!" message should appear in the terminal output.

> You may be prompted to set ZSH as your default shell.

### Optional: Enable ZSH syntax highlighting
Install syntax highlighting for ZSH by running:

```bash
sudo dnf install zsh-syntax-highlighting
```

Now run:

```bash
echo "source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc
```

### Optional: Change ZSH theme using Oh-My-ZSH

Oh-My-ZSH is installed with [several themes](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes). Let's change the default theme to `blinks` by first opening the `.zshrc` file:

```bash
sudo nano ~/.zshrc
```

Find the line `ZSH_THEME="robbyrussell"` and change it to `ZSH_THEME="blinks"` and save. The new theme will be applied to new terminal windows.

### Optional: Enable ZSH plugins

Plugins add functionality to ZSH. Let's enable some [pre-installed plugins](https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins) for a few programming languages. First, open the `.zshrc` file:

```bash
sudo nano ~/.zshrc
```

Find the line `plugins=(git)` and change it to include your preferred plugins. An example:

```
plugins=(git dotnet rust golang mvn npm terraform aws gradle)
```

Save the file. The plugins will be applied to new terminal windows.

## Install Zed

**The instructions for installing Zed are derived from https://zed.dev/docs/linux#zed-on-linux and are current as of 2024-08-29**

Zed is a highly-efficient, cross-platform code editor written in Rust.

Run the following command to install Zed:

```bash
curl https://zed.dev/install.sh | sh
```

To run Zed after installation, run:

```bash
zed
```

## Install Visual Studio Code

**The instructions for installing Visual Studio Code are derived from https://code.visualstudio.com/docs/setup/linux and are current as of 2024-08-29**

1. Run the following commands:

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null
dnf check-update
sudo dnf install code
```

2. Launch Visual Studio Code
1. Navigate **File** > **Preferences** > **Settings** and then type "telemetry"
1. Select "off" for the **Telemetry Level**
1. Disable the "Dotnet Acquisition Extension: Enable Telemetry" option
1. Optional: While still in **Settings**, change the following to "False":
   1. **Enable Natural Language Search**
   1. **Enable Experiments**
1. Optional: While still in **Settings**, enable **Editor: Format on Save**. Turning this setting on is the same as running the **Format Document** command each time you save a file.
1. Optional: While Visual Studio Code is open, select **Activities**, right-click the Visual Studio Code icon on the dock, and select **Add to favorites**.

The following VS Code extensions are handy:

1. [HashiCorp Terraform](https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform)
1. [Go](https://marketplace.visualstudio.com/items?itemName=golang.Go)
1. [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) - syntax highlighting, debugging, test runner support, and intellisense for C#
1. [Rust-Analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) - Rust language server
1. [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) - for debugging Rust code on Ubuntu
1. [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) - syntax highlighting, debugging, and intellisense for Java, plus unit testing support
1. [Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=Pivotal.vscode-boot-dev-pack) - specific enhancements for working with Spring Boot
1. [VS Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare) - allows simultaneous editing of code files by multiple authors, like Google Docs
1. [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
1. [Kubernetes](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools)
1. [JavaScript Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
1. [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
1. [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin)
1. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

There are some excellent dark theme alternatives to the VS Code default theme:

1. [One Monokai Theme](https://marketplace.visualstudio.com/items?itemName=azemoh.one-monokai)
1. [Atom One Dark Theme](https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark)
1. [Material Theme](https://marketplace.visualstudio.com/items?itemName=Equinusocio.vsc-material-theme)
1. [Blueberry Dark Theme](https://marketplace.visualstudio.com/items?itemName=peymanslh.blueberry-dark-theme)
1. [Arc+ Theme](https://marketplace.visualstudio.com/items?itemName=ph-hawkins.arc-plus)
1. [Arc Darker Theme](https://marketplace.visualstudio.com/items?itemName=alvesvaren.arc-dark)
1. [Neon City](https://marketplace.visualstudio.com/items?itemName=lakshits11.neon-city)

### Working with VSCode extensions from the terminal

To see which VSCode extensions are installed:

```bash
code --list-extensions
```

You can install VSCode extensions from the terminal, too. Run the following commands to install HashiCorp's Terraform extension, Google's Go extension, and Microsoft's Docker extension:

```bash
code --install-extension HashiCorp.terraform
code --install-extension golang.Go
code --install-extension ms-azuretools.vscode-docker
```

## Install Postman

Postman is a complete toolchain for API developers.

```bash
flatpak install flathub com.getpostman.Postman
```

## Git configuration

```bash
git config --global user.name "Your Name"
git config --global user.email yourname@yourdomain.com
git config --global init.defaultBranch main
```

See [Customizing Git Configuration](https://www.git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) for more details. You can edit the global Git config file by running `gedit ~/.gitconfig` in a terminal window.

> Tip: Remember that you can include a longer commit message by using a second `-m` in your command. Example: `git commit -m "The short message, best ~50 characters" -m "The extended description that can go on however long you want."`

## SSH Keys for GitHub/GitLab

**The instructions for generating SSH keys is derived from https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent. Instructions for adding an SSH key to GitHub is derived from https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account. Both are current as of 2024-08-29**

1. Run `ssh-keygen -t ed25519 -C "your_email@example.com"`
1. Enter a passphrase
1. Run `ssh-add ~/.ssh/id_ed25519`
1. Run `cat ~/.ssh/id_ed25519.pub`
1. Copy the output from `cat` and paste it into GitLab and GitHub's SSH key sections for your profile
1. Run `ssh -T git@github.com` to [verify the key is recognized and working with GitHub.com](https://help.github.com/en/github/authenticating-to-github/githubs-ssh-key-fingerprints)
1. Run `ssh -T git@gitlab.com` to verify the key is recognized and working with GitLab

## GPG Keys for Signing Commmits and Tags

**The instructions for generating GPG keys is derived from https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key. Instructions for adding a GPG key to GitHub is derived from https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account. Both are current as of 2024-09-12**

1. Run `gpg --full-generate-key`
1. Choose "RSA and RSA (default)"
1. Choose 4096 bits
1. Choose a timeframe of your choice. It's recommended not to set an expiration.
1. When providing an email, it is recommended to use your `noreply@github.com` email address.
1. Provide a secure passphrase.
1. Run:

```bash
gpg --list-secret-keys --keyid-format=long
```

8. From the list of GPG keys, copy the long form of the GPG key ID you'd like to use. E.g. `8FF7C99772967AA3`:
1. Run `gpg --armor --export 8FF7C99772967AA3`, replacing the GPG key ID with the ID produced from step 8.
1. Copy your GPG key, beginning with `-----BEGIN PGP PUBLIC KEY BLOCK-----` and ending with `-----END PGP PUBLIC KEY BLOCK-----`.
1. Add the GPG key to your GitHub account.


## Java

Java is already installed by default on Fedora Workstation. To verify:

```bash
java -version
```

Look for an `openjdk version` message to verify success.

See https://docs.fedoraproject.org/en-US/quick-docs/installing-java/ for installing different versions of Java.

## .NET

```bash
sudo dnf install dotnet-sdk-8.0
```

Run `dotnet --list-sdks` and look for the following output to verify success:

```
8.0.108 [/usr/lib64/dotnet/sdk]
```

Opt out of .NET's telemetry:

1. Run `nano ~/.profile`
1. Type `export DOTNET_CLI_TELEMETRY_OPTOUT=true` at the bottom of the file
1. Save and exit
1. Log out and log in again

## Go

**Instructions for installing Go taken from https://go.dev/doc/install on 2024-08-30**

Installing Go can be done using `dnf`:

```bash
sudo dnf install go
```

Using `dnf` will likely install a slightly oudated version of Go. You can alternatively run the following commands to install an up-to-date version of Go. Be sure to replace the version number in the commands below with the version number you want to install. These are the same commands you will use to update Go to a newer version.

```bash
curl -OL https://golang.org/dl/go1.23.0.linux-amd64.tar.gz
sha256sum go1.23.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
```

If you are upgrading Go using these commands, then run the following command to verify success:

```bash
go version
```

Look for `go version go1.23.0 linux/amd64` (or newer).

If this is a first-time installation of Go, then running `go version` is likely to display the following output:

```
bash: go: command not found...
Packages providing this file are:
'gcc-go'
'golang-bin'
```

You must set the following environment variables to fix the "command not found" problem after the initial Go installation. _You do not need to repeat this step if you're upgrading an existing Go installation._

```bash
echo "export PATH=$PATH:$(go env GOPATH)/bin:/usr/local/go/bin" >> ~/.profile
source ~/.profile
```

Now run `go version` and you should see the expected version number output to the terminal.

## Terraform

**Instructions for installing Terraform taken from https://developer.hashicorp.com/terraform/cli/install/yum on 2024-09-02**


```bash
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/fedora/hashicorp.repo
sudo dnf install terraform
```

Run `terraform --version` to verify the installation was a success.

## Podman

**Instructions for installing Podman taken from https://podman.io/docs/installation on 2024-09-02**

Podman is installed by default in Fedora 40 Workstation. To confirm, run:

```bash
podman run hello-world
```

If for some reason you don't have Podman installed you can install it using this command:

```bash
sudo dnf -y install podman
```

## Podman Desktop

![Podman Desktop](<./images/podman01.png>)

Podman Desktop is an open source graphical tool for managing containers locally, much like Docker Desktop. To install:

```bash
flatpak install flathub io.podman_desktop.PodmanDesktop
```

You'll be asked to go through a setup process when running Podman Desktop for the first time. Check all 3 boxes. This will install Podman Compose and `kubectl` system-wide.

## Install Kind and Configure with Podman Desktop

In Podman Desktop, find the "Kind" button on the bottom left of the window and select it. A prompt should appear asking if you want to install Kind. Select Yes. Once completed, open a terminal and run the following command to confirm:

```bash
kind get clusters
```

You should see this output:

```bash
enabling experimental podman provider
No kind clusters found.
```

Back in **Podman Desktop**, go to **Settings** > **Resources** and find the **Kind** tile. Select **Create new...**. Use these settings:

```
Name                       kind-cluster
Provider type:             podman
HTTP port:                 9090
HTTPS port:                9443
Set up ingress controller: Enabled
Node's container image:    (blank)
```

The GUI should display "Successful operation" after a few seconds.

Navigate to the **Kubernetes** tab:

![Podman Desktop in the Kubernetes Section of Settings](<./images/podman02.png>)

You should see a Kind cluster running as shown in the image above.

Confirm that your Kubernetes context is set to the local Kind cluster:

```bash
kubectl config current-context
```

Observe `kind-kind-cluster` as the output.

## Helm

If you followed along with the Podman Desktop installation instructions, you now have a Kubernetes Cluster (via Kind) and `kubectl` installed. Let's now install Helm.

```bash
sudo dnf install helm
```

Run `helm version` to verify success.

## AWS CLI Tools

Fedora has a package for AWS CLI tooling:

```bash
sudo dnf install awscli
```

Run `aws --version` to verify success.

## Azure CLI tools

The simplest way to install the [Azure CLI](https://packages.fedoraproject.org/pkgs/azure-cli/azure-cli/) tools:

```bash
sudo dnf install azure-cli
```

Verify success by running `az --version`. Note that installing via `dnf` will install an older version of the Azure CLI tools. 

You cannot run `az upgrade` to upgrade the Azure CLI tools when they were installed using `dnf`.

See [Install Azure CLI on Linux](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=dnf) for alternative installation methods that will ensure newer versions are installed.

## Set up and connect to a containerized PostgreSQL Server

One can run PostgreSQL in a container rather than installing locally. We can also start a second PostgreSQL container to connect to the first container and run commands.

The advantage to using a second PostgreSQL container to run SQL commands is that we don't need to install PostgreSQL tools locally.

> While Podman and Docker are similar, the rootless nature of Podman containers means the required commands to make container-to-container networking function correctly differ between the two tools. This guide is specific to Podman. Making a similar connection using Docker would require creating a new network in `bridge` mode and setting both containers to use that network, which is not possible in Podman without using rootful containers.

Let's get started.

1. First create a pod:

```bash
podman pod create --name test-pod1 --share net -p 5432:5432
```

2. Next, create and run the main PostgreSQL container that you want to use as the database server:

```bash
podman run --pod test-pod1 --detach --rm --name test-container1 --env POSTGRES_PASSWORD=my-secret-pw postgres:latest
```

3. Finally, create the second PostgreSQL container that you want to use for issuing commands to the first container:

```bash
podman run --pod test-pod1 -it --rm --name test-container2 postgres psql -U postgres -h localhost -p 5432 -d postgres
```

After step 3, you should see a `postgres=#` prompt. Type `SELECT table_name FROM information_schema.tables;` and press **Enter** to verify success. Type `q` to exit the table list view. 

> You can always open Podman Desktop to easily delete pods and containers if you mess things up.

### Connect to the PostgreSQL container from a Go program

[Go PostgreSQL example code](./app-examples/golang-postgres/) is a runnable Go program that should "just work" if you followed the steps above.

```go
package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "my-secret-pw"
	dbname   = "postgres"
)

func main() {
	// connection string
	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	// open database
	db, err := sql.Open("postgres", psqlconn)
	CheckError(err)

	sql := `SELECT datname FROM pg_database`
	rows, err := db.Query(sql)
	CheckError(err)

	defer rows.Close()
	for rows.Next() {
		var datname string

		err = rows.Scan(&datname)
		CheckError(err)

		fmt.Println(datname)
	}

	// close database
	defer db.Close()

	// check db
	err = db.Ping()
	CheckError(err)

	fmt.Println("Connected!")
}

func CheckError(err error) {
	if err != nil {
		panic(err)
	}
}
```

Let's run the Go code example from the `app-examples` folder in this repository:

```bash
cd ./app-examples/golang-postgres
go get github.com/lib/pq
go run .
```

You should see the following output:

```
postgres
template1
template0
Connected!
```

## Dev Containers

Dev Containers are a way to containerize your development environment. They make your development setup portable and consistent.

However, one thing we must do is configure the Dev Containers VSCode extension to use Podman instead of Docker. This is because the Dev Containers extension assumes you have Docker, but the Fedora Setup guide is using Podman instead. If you've followed along with this guide, how would you go about configuring this?

1. First, get the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension for Visual Studio Code.

1. Open **File** > **Preferences** > **Settings** in Visual Studio Code.

1. Type "Dev Containers" into the **Settings** search box.

1. Change **Dev > Containers: Docker Compose Path** to `podman compose`

1. Change **Dev > Containers: Docker Path** to `podman`

1. Change **Dev > Containers: Docker Socket Path** to `unix:///run/user/1000/podman/podman.sock`.

This is also a good time to update your Docker VSCode extension settings to work with Podman:

7. Type "Docker" into the **Settings** search box.

8. Change **Docker: Docker Path** to `podman`.

9. Change **Docker: Docker Compose Path** to `podman compose`.

10. Add a new environment variable to **Docker: Environment** with item = `DOCKER_HOST` and value = `unix:///run/user/1000/podman/podman.sock`.

Now let's look at an example `devcontainer.json` file that might appear in a repository:

```json
{
	"name": "name here",
	"image": "path-to-image-here",
	"containerUser": "vscode",
	"updateRemoteUserUID": true,
	"containerEnv": {
		"HOME": "/home/vscode"
	},
	"runArgs": [
		"--userns=keep-id:uid=1000,gid=1000"
	]
}
```

Setting `containerUser` to "vscode" ensures that the container uses the `vscode` user to create workspaces. Otherwise, the container might try to create workspaces under `/root`, which will fail in Podman.

This ensures that the `vscode` user is really mapped inside of the container, and it also ensures that `vscode`'s HOME is set explicitly.

> You may still run into trouble with DevContainers using these steps above. Most DevContainer examples assume you're running rootful containers under Docker and _not_ rootless containers in Podman.

## KVM + QEMU + VirtManager

**Instructions derived from https://docs.fedoraproject.org/en-US/quick-docs/virtualization-getting-started/ and https://fedoramagazine.org/full-virtualization-system-on-fedora-workstation-30/**

We can use Linux's built-in Kernel Virtual Machine (KVM) plus QEMU and VirtManager to build, run, and manage VMs.

```bash
sudo dnf install @virtualization
```

Now start the service:

```bash
sudo systemctl start libvirtd
```

Start the service on boot by running:

```bash
sudo systemctl enable libvirtd
```

Verify success by looking for `kvm_intel` or `kvm_amd` in the following:

```bash
lsmod | grep kvm
```

You'll want to administer `libvirt` with the regular user. Otherwise, every time you start `virt-manager` you will need to do so with `sudo` and enter your password.

```bash
sudo usermod -a -G libvirt $(whoami)
```

Now log out and log in again.

### Create a new VM using `virt-manager`
1. Download the [Fedora Silverblue](https://fedoraproject.org/atomic-desktops/silverblue/download/) ISO or the ISO of your choice
1. Place the `.iso` file into the `/var/lib/libvirt/images` folder:

```bash
cd ~/Downloads
sudo mv Fedora-Silverblue-ostree-x86_64-40-1.14.iso /var/lib/libvirt/images
```

3. Open the **Virtual Machine Manager** (aka `virt-manager`)
1. Add a new virtual machine. Note that if you get a connection error, you should reboot your machine.
1. Select **Local install media** and then **Forward**. Step 2 of 5 appears.
1. Select **Browse**. The ISO you copied into the `/var/lib/libvirt/images` folder should appear.
1. Select the ISO and choose **Choose Volume**
1. You  may need to select an operating system. if Virtual Machine Manager couldn't auto-detect one based on the ISO. In our case, using Fedora Silverblue, "Fedora Silverblue 40" is auto-detected and we can skip manual OS selection.
1. Select **Forward**
1. Choose at least "8192" for memory and 2 CPUs and then select **Forward**
1. Choose at least 25 GB of disk storage and select **Forward**
1. Use a distinctive name for the VM and select **Finish**
1. The VM should start automatically. Go through the VM setup process.

### Adjusting screen size

On 4K monitors the VM image may be tiny. You can use a `virt-manager` setting to try and adjust this:

1. Select **View**
1. Select **Scale Display**
1. Check the box titled **Auto resize VM with window**.

### Taking snapshots

Snapshots can be taken in `virt-manager` just like in Virtual Box. You must navigate into the VM window (not the Virtual Machine Manager window) and select the Manage VM Snapshots icon at the far right of the toolbar. 

The button to create a snapshot is the **+** (plus) symbol on the bottom left of the window.

## Firefox

See https://wiki.mozilla.org/Privacy/Privacy_Task_Force/firefox_about_config_privacy_tweeks for advanced privacy-related Firefox configuration options.

This Fedora 40 Setup Guide does _not_ list all the options on the site above. It's recommended you visit that site and decide on each option for yourself. However, a few privacy tweaks are important enough that they are worth mentioning here.

Open `about:config` in your Firefox URL bar and accept the warning to proceed with making these privacy tweaks.

```
dom.private-attribution.submission.enabled = false
```

Attribution is a way to track whether ads served to you were effective in getting you to buy something. More information is available at https://github.com/mozilla/explainers/tree/main/ppa-experiment. The above command disables this feature.

```
privacy.resistFingerprinting = true
```

This setting improves your defenses against [browser fingerprinting](https://coveryourtracks.eff.org/learn).

```
dom.event.clipboardevents.enabled = false
```

This setting prevents websites from knowing if you used copy or paste commands and what part of the page you had selected when you used those commands.

```
webgl.disabled = true
```

This command disables WebGL. If you never visit sites with WebGL content then it can be safely disabled.

## Install and Configure USBGuard

USBGuard enables you to block USB device access. This is useful for protecting against rogue USB devices (think "BadUSB") by implementing a USB blocklist and USB device policy.

> Warning: Installing USBGuard using the steps below will create a policy that allows only currently-connected USB devices to be usable on the next boot. You can and should review this policy right after installation to ensure you can continue to use your PC. For instance, if you use hardware security keys to login, and they were not inserted at the time of USBGuard's installation, you could be locked out of your system permanently. Be cautious.

Let's install USB Guard:

```bash
sudo dnf install usbguard
```

You should also consider installing the USB viewer app, though this is optional:

```bash
sudo dnf install usbview
```
<!-- 
```bash
sudo apt install usbguard usbutils udisks2 usbview
``` -->

You can then graphically view USB devices by running:

```bash
usbview
```

Or through either of these terminal commands:

```bash
lsusb
usb-devices | less
```

We now need to start and then stop the USB Guard service to populate the `rules.conf` file:

```bash
sudo systemctl enable usbguard.service --now
sudo systemctl start usbguard.service
sudo systemctl stop usbguard.service
```

Let's now set an initial policy:

```bash
usbguard generate-policy -X -t reject > /etc/usbguard/rules.conf
```

Now let's modify these configuration files. Open a root terminal and navigate to the `usbguard` directory:

```bash
sudo -i
cd /etc/usbguard
ls -laF
```

Look for `rules.conf` and `usbguard-daemon.conf`.

Let's look at the USBGuard policy:

```bash
sudo grep -vE '^#|^$' /etc/usbguard/usbguard-daemon.conf
```

```ini
RuleFile=/etc/usbguard/rules.conf
RuleFolder=/etc/usbguard/rules.d/
ImplicitPolicyTarget=block
PresentDevicePolicy=apply-policy
PresentControllerPolicy=keep
InsertedDevicePolicy=apply-policy
RestoreControllerDeviceState=false
DeviceManagerBackend=uevent
IPCAllowedUsers=root
IPCAllowedGroups=wheel
IPCAccessControlFiles=/etc/usbguard/IPCAccessControl.d/
DeviceRulesWithPort=false
AuditBackend=FileAudit
AuditFilePath=/var/log/usbguard/usbguard-audit.log
HidePII=false
```

See `ImplicitPolicyTarget=block` on line 3. This line tells the daemon how to treat USB devices that fail to match a rule in the policy. Allowed values are `allow`, `block` or `reject`. A policy of `reject` logically removes the device node from the system.

See `PresentDevicePolicy` on line 4. This line tells the daemon how to treat USB devices that are already connected when the daemon starts. Allowed values are `allow`, `block`, `reject`, `keep` (this maintains the state the device is in) or `apply-policy`. The `apply-policy` default simply means to apply the rules to each USB device.

> You can find further documentation at https://usbguard.github.io/documentation/configuration. 

Let's look at the default ruleset that was created when we started and then stopped the daemon:

```bash
sudo nano /etc/usbguard/rules.conf
```

You should see that all currently connected devices are listed with `allow` as the permission. If you're on a laptop with no devices connected then the file is likely to be empty.

Let's start the daemon and check to see if it's working:


```bash
sudo systemctl restart usbguard.service
sudo systemctl status usbguard.service
sudo usbguard list-rules
```

You can list all USB devices recognized by the daemon:

```bash
sudo usbguard list-devices
```

You can verify it's working by plugging in a USB device and running:

```bash
lsusb
```

Look for the USB device in the list. It should appear, but it shouldn't work - that is, if you plugged in a USB thumb drive, it shouldn't appear as new storage. Let's confirm by running this command:

```bash
sudo dmesg | grep -i 'authorized'
```

If you see the following message or type of message then USBGuard successfully blocked the device:

```
[xxxxx.xxxxxx] usb x-x.x: Device is not authorized for usage
```

Let's authorize the device. We first need to find the device id and serial number. Run this command to list all the blocked devices:

```bash
sudo usbguard list-devices -b
```

Note the device ID and serial number. You will need these values. Then run the command below. Before doing so, replace the `1234:5678` and `ABCDEF` with the values outputted from the `sudo usbguard list-devices -b` command. Executing this command permanently updates the `rules.conf` with an `allow` rule for that device.

> The `-p` flag is for permanent; leaving it off the command would make this a temporary rule that would not persist across a reboot.

> If your device has no serial number, just leave the serial number empty. Example: `""`

```bash
sudo usbguard allow-device '1234:5678 serial "ABCDEF"' -p
```

Restart the USBGuard service:

```bash
sudo systemctl restart usbguard.service
```

With your device still plugged in, run:

```bash
sudo usbguard list-devices -b
```

If your device does not appear in the list of blocked devices then you've successfully whitelisted it.

## Useful Gnome Keyboard Shortcuts

Lastly, let's cover some useful keyboard shortcuts for Gnome. You can find a full list at https://help.gnome.org/users/gnome-help/stable/shell-keyboard-shortcuts.html.en, but a subset are called out here, especially for those switching from other distros or from Windows.

| Key Combo       | Action                     |
| --------------- | -------------------------- |
| `Super` + `TAB` | Switches between windows, much like `ALT` + `TAB` in Windows. Caveat: If you have multiple windows of the same app (e.g. two Firefox windows), this key combo won't switch between them. You'll need to use the down arrow key to expand the 'Firefox' selection into its list of windows, then use the left/right arrow keys to select the window you want. |
| `ALT` + `ESC`   | Switches between windows in the current workspace. Unlike `Super` + `TAB`, this does switch between different windows for the same app. |
 `Super` + `A`    | Shows the list of applications. |
 `Super` + `L`    | Locks the screen. Same behavior as Windows. |
 `Super` + `V`    | Shows the notification screen, including the calendar. Press again to make it disappear. |
 `ALT` + `F2`     | Run a command. |
 `ALT` + `Prnt Scrn`     | Take a screenshot of the active window. |
 `Shift` + `Prnt Scrn`   | Take a screenshot of a screen area. |

## Install Fonts

The easiest way to install a font is to download it, extract the contents, and then double-click on the `.ttf` file. This opens Gnome Font Viewer. In the Gnome Font Viewer window, select the blue **Install** button to install the font.

Alternatively, fonts can be installed by downloading a font and placing it into a ffont family older inside of `/.local/share/fonts`. 

Let's walk through what this would look like. First, download the [Inter font from Google Fonts](https://fonts.google.com/specimen/Inter) to your `/Downloads` folder.

```bash
mkdir -p ~/.local/share/fonts/Inter
cd ~/Downloads
unzip Inter.zip -d Inter/
cp ~/Downloads/Inter-VariableFont_opsz,wght.ttf ~/.local/share/fonts/Inter
```