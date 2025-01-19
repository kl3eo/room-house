#!/bin/bash
mkdir -p ~/VB && cd ~/VB
if [ -f /opt/loop_free.vdi ]; then
 cp -a /opt/loop_free.vdi ./
else
 echo File /opt/loop_free.vdi not found. Exiting
 exit
fi
vboxmanage createvm --name FREE --ostype RedHat_64 --register --basefolder `pwd`
mv loop_free.vdi FREE/ && cd FREE
#vboxmanage modifyvm xTER_free --memory 4096 --cpus 2 --audio none --firmware efi --nic1 nat --nataliasmode1 proxyonly
vboxmanage modifyvm FREE --memory 4096 --cpus 2 --audio none --firmware efi --nic1 bridged --nictype1 virtio --bridgeadapter1 enp0s31f6
vboxmanage createmedium --filename 24G.vdi --size 24576
vboxmanage storagectl FREE --name SATA --add sata
vboxmanage storageattach FREE --storagectl SATA --medium loop_free.vdi --port 0 --type hdd
vboxmanage storageattach FREE --storagectl SATA --medium 24G.vdi --port 1 --type hdd
vboxmanage modifyvm FREE --boot1 disk --boot2 none --boot3 none --boot4 none
