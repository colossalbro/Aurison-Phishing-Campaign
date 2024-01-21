import { DIR_NAME, POSTMARK_TOKEN } from "../config.js";
import { AurisonUser } from "../models/AurisonUser.js";
import { genPhishLink } from "./phish.js";
import {ServerClient} from "postmark";
import fs from "fs";

export class phishEmails{
    constructor(users) {
        this.campaignID = '';
        this.users = users;
        this.postmark = new ServerClient(POSTMARK_TOKEN);
        this.sentEmails = [];       //array of objects {mailID : 'ismsms', email : 'test@test.com'}
        this.loadTemplate();
    }


    loadTemplate() {
        this.template = fs.readFileSync(`${DIR_NAME}/email_template.html`, 'utf-8');
        this.text = fs.readFileSync(`${DIR_NAME}/email_template.txt`, 'utf-8');
    }

    sendEmails() {
        //Postmark doesn't allow script tags for their email templates
        //So We have to do the user injection thing manually :(
        //Later though you can tweak a template to not include <script> and then use that.
        this.users.forEach(user => this.sendEmail(user));
    }

    async sendEmail(user) {
        const body = this.personalizeMail(user);
        const email = await this.postmark.sendEmail({
            "From" : "no-reply@aurisonn.app",
            "To": user.email,
            "Subject": "Information About Your Account",
            "HtmlBody": body.HTML,
            "TextBody": body.TEXT,
            "MessageStream": "upate-to-password-policy"
        });

        if (email && email.Message === 'OK') {
            const data = {
                MesssageID : email.MessageID, 
                To : email.To, 
                Token : body.TOKEN,
                Campaign : this.campaignID,
            };

            this.sentEmails.push(data);
        } 
    }

    personalizeMail(user) {
        const token = genPhishLink();
        var html = this.template.replace("PERSON_NAME", user.fname);

        html = html.replace("PERSON_LINK", `https://www.aurisonn.app/verify/${user.email}/${token}`);

        var text = this.text.replace("PERSON_NAME", user.fname);
        text = text.replace("PERSON_LINK", `https://www.aurisonn.app/verify/${user.email}/${token}`);
        
        return {HTML : html, TEXT: text, TOKEN: token};
    }

}



var obo = new AurisonUser("Mr", "Obo", "Lassoloc", "emailagbawhe@gmail.com", "Aurison");
var david = new AurisonUser("Mr", "David", "David", "1inventordavid@gmail.com", "Aurison");
var colossal = new AurisonUser("Mr", "Colossal", "Lassoloc", "colossal@wearehackerone.com", "Aurison");
var final = new AurisonUser("Mr", "Colossal", "Lassoloc", "colossal@aurisonn.app", "Aurison");
var test = new phishEmails([obo]);
