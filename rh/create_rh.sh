#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_vg.vdi ]; then
        cp -a /opt/loop_vg.vdi ./
else
        echo File /opt/loop_vg.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name VG --ostype RedHat_64 --register --basefolder `pwd`
mv loop_vg.vdi VG/ && cd VG
vboxmanage modifyvm VG --memory 4096 --cpus 2 --audio none --firmware efi --nic1 nat --nictype1 Am79C973 --nataliasmode1 proxyonly
vboxmanage modifyvm VG --natpf1 "chat,tcp,,8443,,443"
vboxmanage modifyvm VG --natpf1 "admin,tcp,,8843,,8443"
#vboxmanage modifyvm VG --natpf1 "ssh,tcp,,2222,,22"
vboxmanage createmedium --filename 2G.vdi --size 2000
vboxmanage storagectl VG --name SATA --add sata
vboxmanage storageattach VG --storagectl SATA --medium loop_vg.vdi --port 0 --type hdd
vboxmanage storageattach VG --storagectl SATA --medium 2G.vdi --port 1 --type hdd
vboxmanage modifyvm VG --boot1 disk --boot2 none --boot3 none --boot4 none
