# peaq-did-raspberry-pi
1. curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
2. source ~/.bashrc
3. nvm -v
4. nvm install 18.12.1
5. node -v
6. https://ubuntu.com/tutorials/install-and-configure-nginx#2-installing-nginx 
7. check nginx
8. git clone and install (https://github.com/peaqnetwork/peaq-did-raspberry-pi)
9.  npm i
10. npm install pm2@latest -g
11. pm2 start index.js
12. pm2 startup
13. sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v18.12.1/bin
/home/pi/.nvm/versions/node/v18.12.1/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
14. pm2 save
15.  check the DID thoroug pm2 log
