# room-house

Room-House software hub
========================

bootx64.efi - an xTER bootloader "as is" - can be used with an EFI flash (/efi/boot/bootx64.efi) to boot RH on a bare-metal box. Make an EFI flash, create a folder /efi/boot/, copy this file there. Select EFI boot as primary in the bare-metal BIOS, then boot from the flash.

loop.vdi - the same bootloader packed into VDI format for use with a VirtualBox.

Download the "loop_rh.vdi" and set a VirtualBox by running "create_rh.sh" script from the "rh" folder, on Linux, or a similar line-by-line commands for Windows. See the instruction in detail for all commands on Windows titled "Setting up you own Room-House" at https://github.com/kl3eo/room-house/blob/main/xTER_VB_install.txt. 

Restart the VM to fetch the latest Room-House release, or hit the reset button if you're on bare metal.

# xTER releases with Room-House timeline

15.04.23 -- v1.33 released; IP-based Room-House available on change EXT in settings; new certs upload allowed to everyone; domain change working now.

13.09.22 -- v1.32 released; rewritten CSS users_controls; chairs added; fix addUser.pl condition; R-H finalized to a12.js

01.08.22 -- v1.31 released; users controls/ added demo mode / multicab improved / stall pages, etc.

17.05.22 -- released version 1.30 with initial one-to-many capability;

14.02.22 -- 1.29 with newer Java server; VG and R-H trimmed based on ~2,000 visits in Google Ads campaigns in Dec-Feb

09.08.21 -- released v1.27;

03.06.21 -- v1.26; free KMS Edition; this is the first xTER package with Kurento Media Server and Room-House.
