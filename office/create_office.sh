#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_office.vdi ]; then
        cp -a /opt/loop_office.vdi ./
else
        echo File /opt/loop_office.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name xTER_office --ostype RedHat_64 --register --basefolder `pwd`
mv loop_office.vdi xTER_office/ && cd xTER_office
vboxmanage modifyvm xTER_office --memory 6144 --cpus 2 --audio none --firmware efi --nic1 nat --nataliasmode1 proxyonly
vboxmanage modifyvm xTER_office --natpf1 "chat,tcp,,8443,,443"
vboxmanage modifyvm xTER_office --natpf1 "admin,tcp,,8843,,8443"
vboxmanage modifyvm xTER_office --natpf1 "kms,tcp,,8467,,8467"
vboxmanage createmedium --filename 2G.vdi --size 2000
vboxmanage storagectl xTER_office --name SATA --add sata
vboxmanage storageattach xTER_office --storagectl SATA --medium loop_office.vdi --port 0 --type hdd
vboxmanage storageattach xTER_office --storagectl SATA --medium 2G.vdi --port 1 --type hdd
vboxmanage modifyvm xTER_office --boot1 disk --boot2 none --boot3 none --boot4 none
