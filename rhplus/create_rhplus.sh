#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_rhplus.vdi ]; then
        cp -a /opt/loop_rhplus.vdi ./
else
        echo File /opt/loop_rhplus.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name RHplus --ostype RedHat_64 --register --basefolder `pwd`
mv loop_rhplus.vdi RHplus/ && cd RHplus
vboxmanage modifyvm RHplus --memory 4096 --cpus 2 --audio none --firmware efi --nic1 nat --nataliasmode1 proxyonly
vboxmanage modifyvm RHplus --natpf1 "chat,tcp,,8443,,443"
vboxmanage modifyvm RHplus --natpf1 "admin,tcp,,8843,,8443"
vboxmanage createmedium --filename 2G.vdi --size 2000
vboxmanage storagectl RHplus --name SATA --add sata
vboxmanage storageattach RHplus --storagectl SATA --medium loop_rhplus.vdi --port 0 --type hdd
vboxmanage storageattach RHplus --storagectl SATA --medium 2G.vdi --port 1 --type hdd
vboxmanage modifyvm RHplus --boot1 disk --boot2 none --boot3 none --boot4 none
