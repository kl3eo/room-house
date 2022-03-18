#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_home.vdi ]; then
        cp -a /opt/loop_home.vdi ./
else
        echo File /opt/loop_home.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name xTER_home --ostype RedHat_64 --register --basefolder `pwd`
mv loop_home.vdi xTER_home/ && cd xTER_home
vboxmanage modifyvm xTER_home --memory 6144 --cpus 2 --audio none --firmware efi --nic1 nat --nataliasmode1 proxyonly
vboxmanage modifyvm xTER_home --natpf1 "chat,tcp,,8443,,443"
vboxmanage modifyvm xTER_home --natpf1 "admin,tcp,,8843,,8443"
vboxmanage createmedium --filename 2G.vdi --size 2000
vboxmanage storagectl xTER_home --name SATA --add sata
vboxmanage storageattach xTER_home --storagectl SATA --medium loop_home.vdi --port 0 --type hdd
vboxmanage storageattach xTER_home --storagectl SATA --medium 2G.vdi --port 1 --type hdd
vboxmanage modifyvm xTER_home --boot1 disk --boot2 none --boot3 none --boot4 none
