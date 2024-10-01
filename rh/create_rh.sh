#!/bin/bash

mkdir -p ~/VB && cd ~/VB

if [ -f /opt/loop_rh.vdi ]; then
        cp -a /opt/loop_rh.vdi ./
else
        echo File /opt/loop_rh.vdi not found. Exiting
        exit
fi

vboxmanage createvm --name RH --ostype RedHat_64 --register --basefolder `pwd`
mv loop_rh.vdi RH/ && cd RH
vboxmanage modifyvm RH --memory 4096 --cpus 2 --audio none --firmware efi --nic1 bridged --nictype1 virtio --bridgeadapter1 enp0s31f6
#vboxmanage modifyvm RH --memory 4096 --cpus 2 --audio none --firmware efi --nic1 nat --nictype1 Am79C973 --nataliasmode1 proxyonly
#vboxmanage modifyvm RH --natpf1 "chat,tcp,,8443,,443"
#vboxmanage modifyvm RH --natpf1 "admin,tcp,,8843,,8443"
#vboxmanage modifyvm RH --natpf1 "ssh,tcp,,2222,,22"
vboxmanage createmedium --filename 3G.vdi --size 3072
vboxmanage storagectl RH --name SATA --add sata
vboxmanage storageattach RH --storagectl SATA --medium loop_rh.vdi --port 0 --type hdd
vboxmanage storageattach RH --storagectl SATA --medium 3G.vdi --port 1 --type hdd
vboxmanage modifyvm RH --boot1 disk --boot2 none --boot3 none --boot4 none
