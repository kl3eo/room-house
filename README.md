# room-house

Room-House software hub
========================

bootx64.efi - RH bootloader "as is" - can be used with an EFI flash (/efi/boot/bootx64.efi) to boot RH on a bare-metal box. Just make an EFI flash, create a folder /efi/boot/, copy this file there. Select EFI boot as primary in this bare-metal box'es BIOS, then boot from the flash.

loop.vdi - the same bootloader packed into VDI format for use with a VirtualBox. See script and text file in this github folder about how to use it with the VB.
