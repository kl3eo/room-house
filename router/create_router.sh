#!/bin/bash
mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_router.vdi ]; then
        cp -a /opt/loop_router.vdi ./
else
        echo File /opt/loop_router.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name xTER_router --ostype RedHat_64 --register --basefolder `pwd`
mv loop_router.vdi xTER_router/ && cd xTER_router
vboxmanage modifyvm xTER_router --memory 2048 --cpus 2 --audio none --firmware efi --nic1 nat --nataliasmode1 proxyonly
vboxmanage modifyvm xTER_router --natpf1 "admin,tcp,,8843,,443"
vboxmanage createmedium --filename 1G.vdi --size 1000
vboxmanage storagectl xTER_router --name SATA --add sata
vboxmanage storageattach xTER_router --storagectl SATA --medium loop_router.vdi --port 0 --type hdd
vboxmanage storageattach xTER_router --storagectl SATA --medium 1G.vdi --port 1 --type hdd
vboxmanage modifyvm xTER_router --boot1 disk --boot2 none --boot3 none --boot4 none
