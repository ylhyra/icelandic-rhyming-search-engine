# Ýmsar prófanir til að senda kóðann upp í skýið, mótþróinn gegn Docker lifir því miður enn

scp -r rhyme.sql.bz2 root@ssh.egill.xyz:/home/egill/islenska/files/datasets/rhyme.sql.bz2

scp package.json root@ssh.egill.xyz:/home/egill/rhyme/package.json
scp -r rhyme.sql.bz2 root@ssh.egill.xyz:/home/egill/rhyme/rhyme.sql.bz2

# Install Package.json
scp package.json root@ssh.egill.xyz:/home/egill/rhyme/package.json


ssh root@ssh.egill.xyz rm -r /home/egill/rhyme/server &&
scp -r server root@ssh.egill.xyz:/home/egill/rhyme/ &&
# ssh -t root@ssh.egill.xyz "cd /home/egill/rhyme/server/ && npm i"
ssh root@ssh.egill.xyz pm2 reload rhyme



scp google1527820e7c7572e5.html root@ssh.egill.xyz:/home/egill/rhyme/publics

pm2 start /home/egill/rhyme/server/index.js --name rhyme