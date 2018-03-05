## TODO

- Log
- Log referrer




scp -r rhyme.sql.bz2 root@ssh.egill.xyz:/home/egill/islenska/files/datasets/rhyme.sql.bz2

scp package.json root@ssh.egill.xyz:/home/egill/rhyme/package.json
scp -r rhyme.sql.bz2 root@ssh.egill.xyz:/home/egill/rhyme/rhyme.sql.bz2


scp -r server root@ssh.egill.xyz:/home/egill/rhyme/server
scp -r public root@ssh.egill.xyz:/home/egill/rhyme/public

pm2 start /home/egill/rhyme/server/index.js --name rhyme