import crypto from 'crypto';
import fs from 'fs';



//create a random 20 charcter string.
//serves as the salt for the HashPwd func
export function genSalt() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
  
    // Generate random bytes
    const randomBytes = crypto.randomBytes(20);
  
    for (let i = 0; i < 20; i++) {
      const index = randomBytes[i] % characters.length;
      salt += characters.charAt(index);
    }

    return salt;
}



//hash passwords using a randomly generated salt.
export function hashPwd(password) {
    const salt = genSalt();
    const hash = crypto.createHash('sha512');

    hash.update(password)
    hash.update(salt);

    return hash.digest('hex');
}



//grab credentials (email and pwd) and put them in a makeshift queue
export function grabCreds(reqObject, q) {
    const {username, password} = reqObject.body;

    q.push(`${username}:${hashPwd(password)}\n`) //looks something like test@tes.com:sha_512_hash_here\n
}



//writes the contents of an array (makeshift queue) to a file.
export function writeCreds(q) {
    if (q.length > 0) {
        const copy = q.slice()      //create copy. Really not necessary :)
        q.length = 0            


        const data = copy.join('');      //Join everything together since there's already a \n.

        fs.appendFile('aurison_creds_dump.txt', data, (err) => {
            if (err) console.error('Error: ', err);
        });

        
    }
}