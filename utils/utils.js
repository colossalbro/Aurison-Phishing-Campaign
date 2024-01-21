import { AurisonUser } from '../models/AurisonUser.js';
import { fileURLToPath } from 'url';
import { DIR_NAME } from '../config.js';
import crypto from 'crypto';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';


//createDir. Equivalent of __dirname for Es6 syntax
// export function dirName() {
//     const __filename = fileURLToPath(import.meta.url);
//     return path.dirname(__filename)
// }


export function timeStamp() {
    const stamp = new Date().getTime();
    return stamp;
}




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
// export function grabCreds(reqObject, q) {
//     const {username, email, password, old} = reqObject.body;

//     const pass = password ? password : old;
//     const user = username ? username : email;

//     q.push(`${user}:${hashPwd(pass)}\n`) //looks something like test@tes.com:sha_512_hash_here\n
// }




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




//Parse .xlsx file to extract aurison users from it.
export function parseXlsx(filepath) {
    try{
        let users = [];

        const book = xlsx.readFile(filepath);

        let firstSheet = book.SheetNames[0]; //sheet1
        let sheet = book.Sheets[firstSheet]; //load the sheet data

        const data = xlsx.utils.sheet_to_json(sheet); //parse the sheet as json

        data.forEach(json => users.push( AurisonUser.fromXlsx(json) ) ); //create aurison users and add them to users array.

        
        return users;


    } catch(err) {
        console.log(err);
    }
}




//Delete the xlsx file that has been processed.
export function deleteUpload(q) {
    const copy = q.slice()      //create copy. Really not necessary :)
    q.length = 0;

    copy.forEach(path => {
        let fullPath =`${DIR_NAME}/uploads/${path}`

        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${err.message}`);
        });

    });
  
}




//Delete xlsx files created by the info method of Campaign class
export function deleteXlsx(path) {
    fs.unlink(path, (err) => {
        if (err) console.error(`Error deleting file: ${err.message}`);
    });
}
