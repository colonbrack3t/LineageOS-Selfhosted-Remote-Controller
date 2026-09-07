# LineageOS-Selfhosted-Remote-Controller
Simple extendable remote controller for LineageOS / Android devices. Serves up a remote control web ui on the LineageOS's IP, allows anyone to control the device.

<img width="198" height="392" alt="Screenshot 2026-09-07 at 08 38 38" src="https://github.com/user-attachments/assets/d9837690-85a2-472d-83fe-a58814febba6" />
<img width="198" height="392" alt="Screenshot 2026-09-07 at 08 40 20" src="https://github.com/user-attachments/assets/c4185ae5-4b10-403a-ae63-6b3df5630c21" />
<img width="198" height="392" alt="Screenshot 2026-09-07 at 08 39 06" src="https://github.com/user-attachments/assets/4f2a4d54-df85-4b45-abd3-15f1839be896" />


## To use

### Prerequisite
- Device running LineageOS / Android
- SSH Server running on device with root access

1) Clone entire repo to local. 

2) Move the code to the LineageOS device
```shell
scp -O fast-server.sh handler.sh root@[LineageOS IP]:/data/local/remote/
scp -O static/index.html static/app.js root@[LineageOS IP]:/data/local/remote/static/
```
3) Run `server.sh`
```shell
ssh root@[LineageOS IP]
sh /data/local/remote/server.sh
```

4) On phone / different device, navigate to `[LineageOS IP]:8000`.

Confirm you can see the remote control, test that buttons work as expected etc.

If you do not see the remote control, check the following:
- check you have netcat (nc)
- check there are no firewall issues
- check you have the correct ip
- check you are using http not https

6) To ensure the remote control server boots up on startup, do the following:
```shell
vi /system/etc/init/remotecontrol.rc

service remotecontrol /system/bin/sh /data/local/remote/server.sh
  class main
  user root
  group root
  oneshot
  seclabel u:r:su:s0
```

# Expansion and development
If you wish to stop running the remote control at any point, you can run `killall nc` (Assuming you have no other vital netcat processes running).

If you wish to change the frontend or handler.sh, stopping and starting the server is not required. Just update the files in your device. 

## API Endpoints

`/kc/<int>` can be used to send any Android inputevent keycode to run in the device. If you wish to add more input event functionality, only the frontend code (static files) would need to be updated.

`/cmd/screenshot` is reserved to trigger a new screencap to be made of the screen. 
