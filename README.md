# Fedora 40 Setup Guide

This repository contains instructions to set up Fedora 40 Workstation for developing software in Go, Rust, C# (.NET Core), Java, and other languages. 

## Update the OS and install common tools

The first thing you should do is update Fedora:

```bash
yum update
```

If you just wish to see and install security updates, you can do this by first checking what security updates are available:

```bash
yum updateinfo list security
```

Update a specific package by running this command:

```bash
yum update name-of-package
```

