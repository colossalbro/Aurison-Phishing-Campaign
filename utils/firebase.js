import { FIREBASE_CONFIG_PATH, DIR_NAME } from "../config.js";
import { Campaign } from '../models/Campaign.js';
import { Email } from "../models/Email.js";
import { phishEmails } from "./sendemail.js";
import { parseXlsx, genSalt } from './utils.js';
import { Token } from "../models/Token.js";
import pkg from 'firebase-admin';
import { AurisonUser } from "../models/AurisonUser.js";



const service = FIREBASE_CONFIG_PATH

let firebaseInstance;




export function Firebase() {
    
    if (!firebaseInstance) {

        pkg.initializeApp({
            credential: pkg.credential.cert(service)
        });

        firebaseInstance = pkg;
    }
  

    return firebaseInstance;
}




export const db = () => {
    const base = Firebase();

    return base.firestore();
};




export async function createCampaign(campName, fileName) {
    try{
        const firestore = db();
        const users = parseXlsx(fileName);

        const campaign = new Campaign(campName, users);

        const campCollection = firestore.collection('Campaigns');


        const doc = await campCollection.doc(campaign.id)
        
        const res = await doc.set({
            "Name" : campaign.name,
            "Created" : campaign.created,
            "Active" : campaign.active,
            "sentEmails" : campaign.sentEmails
        });

        campaign.users.forEach(async user => {
            const res = await doc.collection('users').doc(user.email).set(user.toJson());
        });
        
        return campaign.id;  //This would evaluate to true.

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function updateCampaign(Campaign, campID) {
    try {
        const firestore = db();
        const id = Campaign.id;

        const campaignDoc = await firestore.collection('Campaigns').doc(id).get();

        if (campaignDoc.exists) {
            await campaignDoc.ref.update({
                "Name" : Campaign.name,
                "Created" : Campaign.created,
                "Active" : Campaign.active,
                "sentEmails" : Campaign.sentEmails
            });
            return true; // Update successful.
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}



export async function deleteCampaign(campID) {
    try {
        const firestore = db();
        
        const campCollection = firestore.collection('Campaigns');

        const camp = await campCollection.doc(campID).get();

        if (!camp.exists) return false;

        // Delete all documents in the 'users' subcollection
        const usersCollectionRef = camp.ref.collection('users');
        const userDocs = await usersCollectionRef.get();

        // Delete each document in the 'users' subcollection
        await Promise.all(userDocs.docs.map(async (userDoc) => {
            await userDoc.ref.delete();
        }));

        // Delete the main document
        await camp.ref.delete();

        // Delete all Tokens that were under this campaign (concurrently)
        firestore.collection("Tokens").where('campaign', '==', campID).get()
            .then(tokenSnapshot => {
                Promise.all(tokenSnapshot.docs.map(async (token) => {
                    await token.ref.delete();
                }));
            });

        // Delete all Emails sent under this campaign (concurrently)
        firestore.collection("Emails").where('campID', '==', campID).get()
            .then(emailSnapshot => {
                Promise.all(emailSnapshot.docs.map(async (email) => {
                    await email.ref.delete();
                }));
            });

        return true;

    } catch (error) {
        // Likely an invalid campID
        console.error(error);

        return false;
    }
}





export async function getCampaign(id) {
    try{
        const firestore = db();

        const ref = await firestore.collection("Campaigns").doc(id);
        
        const doc = await ref.get();

        if (doc.exists) {
            const data = doc.data();

            const userDocs = await ref.collection("users").get();

            let users = []

            userDocs.forEach(user => {
                const aUser = AurisonUser.fromFirebase(user.data());
                
                users.push(aUser.toJson());
            });

            data.Users = users;

            const campaign = Campaign.fromFirebase(data);
            campaign.setID(doc.id)
            
            return campaign;
        }

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getAllCampaigns() {
    try {
        const firestore = db();
        const data = [];
        const ref = firestore.collection("Campaigns");
        const docs = await ref.get();

        await Promise.all(docs.docs.map(async (doc) => {
            const id = doc.id;
            const json = doc.data();

            let users = [];
            const userSnap = await doc.ref.collection("users").get();

            userSnap.forEach((user) => {
                const aUser = AurisonUser.fromFirebase(user.data());
                users.push(aUser.toJson());
            });

            json.Users = users;

            const campaign = Campaign.fromFirebase(json);
            campaign.id = doc.id;

            if (id) data.push(campaign);
        
        }));

        if (data.length > 0) return data;

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}




export async function createSentEmail(Email){
    try{
        const firestore = db();

        const emailsCollection = firestore.collection('Emails');

        const res = await emailsCollection.doc().set(Email.toJson());     //write sent email.

        return true;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getEmail(mailId) {
    try{
        const firestore = db();

        let data = []

        const ref = firestore.collection("Emails");
        const docs = await ref.where('mailID', '==', mailId).get();

        if (docs.empty) return false;    //no match found :(
        

        docs.forEach(doc => {
            const id = doc.id
            const email = Email.fromFirebase(doc.data());

            if (id) data.push(email);
        })

        if (data.length === 1) return data[0]; //This should be the case all the time.

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getAllEmails() {
    try{
        const firestore = db();

        let data = []
        const ref = firestore.collection("Emails");
        const docs = await ref.get();

        docs.forEach(doc => {
            const id = doc.id
            const email = Email.fromFirebase(doc.data());

            if (id) data.push(email);
        })

        if (data) return data;

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function createSentToken(Token){
    try{
        const firestore = db();

        const tokensCollection = firestore.collection('Tokens');

        const res = await tokensCollection.doc().set(Token.toJson());     //write the token.

        return true;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getToken(tokenID) {
    try{
        const firestore = db();

        let data = []

        const ref = firestore.collection("Tokens");
        const docs = await ref.where('id', '==', tokenID).get();

        if (docs.empty) return false;    //no match found :(
        

        docs.forEach(doc => {
            const id = doc.id
            const token = Token.fromFirebase(doc.data());

            if (id) data.push(token);
        })

        if (data) return data[0];

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getAllTokens() {
    try{
        const firestore = db();

        let data = []
        const ref = firestore.collection("Tokens");
        const docs = await ref.get();

        docs.forEach(doc => {
            const id = doc.id
            const token = Token.fromFirebase(doc.data());

            if (id) data.push(token);
        })

        if (data) return data;

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function createUser(User){
    try{
        const firestore = db();

        const collection = firestore.collection('Users');

        const res = await collection.doc(User.email).set(User.toJson());     //write sent email.

        return true;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getUser(email, campaign) {
    try{
        const firestore = db();

        const campaignRef = firestore.collection("Campaigns").doc(campaign);
        const campaignDoc = await campaignRef.get();


        if (campaignDoc.exists) {
            const userSnapshot = await campaignDoc.ref.collection('users').doc(email).get();

            if (userSnapshot.exists) {
                const user = AurisonUser.fromFirebase(userSnapshot.data());
                
                return user;
            }
            
            return false;
        }

        return false;

    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function getAllUsers(campaign) {
     try{
        const firestore = db();

        const data = [];

        const campaignRef = firestore.collection("Campaigns").doc(campaign);

        const campaignDoc = await campaignRef.get();

        if (campaignDoc.exists) {
            const userQuerySnapshot = await campaignDoc.ref.collection('users').get();
            
            userQuerySnapshot.forEach(user => {
                const aUser = AurisonUser.fromFirebase(user.data());
                
                data.push(aUser);
            });

            return data; 
        }

        return false;
        
    } catch(error) {
        
        console.log(error);
        return false;
    }
}




export async function updateUser(AurisonUser, campaign) {
    try{
        const firestore = db();

        const email = AurisonUser.email;

        const campaignDoc = await firestore.collection('Campaigns').doc(campaign).get();

        if (campaignDoc.exists) {
            const userSnapshot = await campaignDoc.ref.collection('users').doc(email).get();

            await userSnapshot.ref.update(AurisonUser.toJson());

            return true;    //update successful.
        }

        return false;

    } catch(error) {
        console.log(error);
        return false;
    }
}




export async function handlePostMarkEvent(json) {
    const event = json['RecordType'];
    const messageID = json['MessageID'];

    const email = await getEmail(messageID);
    const user = await getUser(email.mailTO, email.campaignID);

   
    if (!user) return false;    //Unlikely, but just in case


    try {
        if (event === 'Open') user.opened_email = true;

        else if (event === 'Click') {
            user.opened_email = true;   //I Do this cuz sometimes postmark doesn't send an Open Event.
                                        //You have to open the email to click the link :) 
            user.clicked_link = true;
        }

        else if (event === 'Delivery') user.sent_email = true;

        else if (event === 'Phished') user.phished = true;  //This isn't an actual postmark event.
        
        else return false;        //Not sure what to do with the event :(


        await updateUser(user, email.campaignID);

        return true;

    } catch (err) {
        console.log(err.message);
        return false;
    }
}




//Update the db of a campaing if the user was phished.
export async function Phished(token) {
    try {
        const tok = await getToken(token)

        const user = await getUser(tok.email, tok.campaign);

        if (!user) return false //nonexistent user.

        user.phished = true;
        return await updateUser(user, tok.campaign);
        

    } catch (err) {
        console.log(err.message);
        return false;
    }

    
}




export async function isCampActive(tokenID) {
    const tok = await getToken(tokenID);

    if (!tok.ID) return false;

    const camp = await getCampaign(tok.campaign);

    return camp.active;
}