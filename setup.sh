#!/bin/bash

###########################
# Update the system
###########################

sudo dnf -y upgrade


###########################
# Install Gnome Tweaks
###########################

sudo dnf -y install gnome-tweaks


###########################
# Install common tools
###########################

sudo dnf -y install make


###########################
# Install Tilix
###########################

sudo dnf -y install tilix


###########################
# Install ZShell
###########################

sudo dnf -y install zsh
chsh -s $(which zsh)
sudo dnf -y install zsh-syntax-highlighting
echo "source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc


###########################
# Install Zed Editor
###########################

curl -f https://zed.dev/install.sh | sh


###########################
# Install VSCode
###########################

sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null
dnf check-update
sudo dnf -y install code

#--------------------------
# Install VSCode Extensions
#--------------------------

code --install-extension HashiCorp.terraform
code --install-extension golang.Go
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
code --install-extension ms-dotnettools.csdevkit
code --install-extension lakshits11.neon-city


###########################
# Install Postman
###########################

flatpak install flathub com.getpostman.Postman


###########################
# Install NodeJS and NPM
###########################

sudo dnf -y install nodejs


###########################
# Install .NET SDK 10.0
###########################

sudo dnf -y install dotnet-sdk-10.0


###########################
# Install GoLang
###########################

sudo dnf -y install go


###########################
# Install Terraform
###########################

wget -O- https://rpm.releases.hashicorp.com/fedora/hashicorp.repo | sudo tee /etc/yum.repos.d/hashicorp.repo
sudo yum list available | grep hashicorp
sudo dnf -y install terraform


###########################
# Install Helm
###########################

sudo dnf -y install helm


###########################
# Install AWS CLI Tools
###########################

sudo dnf -y install awscli


###########################
# Install Azure CLI Tools
###########################

sudo dnf -y install azure-cli


###########################
# Install Virtualization
###########################

sudo dnf -y install @virtualization
sudo usermod -a -G libvirt $(whoami)
