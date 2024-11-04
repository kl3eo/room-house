#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_rh_uti.vdi ]; then
        cp -a /opt/loop_rh_uti.vdi ./
else
        echo File /opt/loop_rh_uti.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name RHU --ostype RedHat_64 --register --basefolder `pwd`
mv loop_rh_uti.vdi RHU/ && cd RHU
vboxmanage modifyvm RHU --memory 6144 --cpus 4 --audio none --firmware efi --nic1 bridged --nictype1 virtio --bridgeadapter1 enp0s31f6
vboxmanage createmedium --filename 4G.vdi --size 4096
vboxmanage storagectl RHU --name SATA --add sata
vboxmanage storageattach RHU --storagectl SATA --medium loop_rh_uti.vdi --port 0 --type hdd
vboxmanage storageattach RHU --storagectl SATA --medium 4G.vdi --port 1 --type hdd
vboxmanage modifyvm RHU --boot1 disk --boot2 none --boot3 none --boot4 none
