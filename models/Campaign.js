import { AurisonUser } from "./AurisonUser.js";
import { timeStamp, genSalt } from "../utils/utils.js";
import { DIR_NAME } from "../config.js";
import xlsx from "xlsx";
import { phishEmails } from "../utils/sendemail.js";
import { Token } from "./Token.js";
import { Email } from "./Email.js";


export class Campaign{
    constructor(name, users) {
        this.id = genSalt();
        this.name = name;
        this.users = [];
        this.created = new Date().toGMTString();
        this.postmark = new phishEmails(this.users);
        this.postmark.campaignID = this.id;
        this.sentEmails = false;
        this.active = false;

        users.forEach(user => this.users.push(user) );
    }


    toJson() {
        var users = []
        this.users.forEach(user => users.push(user.toJson() ));

        return {
            "Name" : this.name,
            "Created" : this.created,
            "Active" : this.active,
            "Users" : users,
            "sentEmails" : this.sentEmails
        };
    }

    setID(id) {
        this.id = id;
        this.postmark.campaignID = id;
        
        return true;
    }

    static fromFirebase(json) {
        var users = []
        json.Users.forEach(user => users.push(AurisonUser.fromFirebase(user)));

        let camp = new Campaign(json.Name, users);
        camp.created = json.Created;
        camp.active = json.Active;
        camp.sentEmails = json.sentEmails

        return camp;
    }

    start() {
        if (this.active) return false;    //campaign already started 

        this.active = true;

        if (!this.sentEmails) {             //First time starting the camp
            this.postmark.sendEmails();
            this.sentEmails = true;
            return this.postmark.sentEmails; 
        }

        return true;
    }

    stop() {
        if (!this.active) return false;     //campaign wasn't active to begin with :)

        this.active = false;

        return true;
    }
    

    
    info() {
        const totalUsers = this.users.length;   //number of users who recieved phishing email
        var usersJson = []        //
        var analytics = [];
        
        let clicked = 0;            //number of users who clicked the link
        let clickedUsers = []      //emails of users who clicked the link

        let phished = 0;            //number of users who submitted their passwords
        let phishedUsers = []      //emails of users who submitted their passwords
        
        let ignored = 0;
        let ignoredUsers = [];

        this.users.forEach(user => {
            usersJson.push(user.toJson());
             
            if (user.clicked_link) {
                clicked += 1;
                clickedUsers.push(user.toJson());
            }

            if (user.clicked_link && user.phished) {
                phished += 1;
                phishedUsers.push(user.toJson());
            }

            if (!user.clicked_link && !user.phished) {
                ignored += 1;
                ignoredUsers.push(user.toJson());
            }
        });

        const percentageClick = (clicked / totalUsers) * 100;
        const percentagePhish = (phished / totalUsers) * 100;
        const percentageIgnored = (ignored / totalUsers) * 100;

        analytics.push({"Data" : `${clicked} OF ${totalUsers} USERS CLICKED THE LINK (${percentageClick}%)` });
        analytics.push({"Data" : `${phished} OF ${totalUsers} USERS SUBMITTED THEIR PASSWORDS (${percentagePhish}%)`});
        analytics.push({"Data" : `${ignored} OF ${totalUsers} OPENED THE EMAIL BUT COMPLETELY IGNORED IT (${percentageIgnored}%)`});
        

        const analyticsSheet = xlsx.utils.json_to_sheet(analytics);          //write the full data to a sheet
        const rawSheet = xlsx.utils.json_to_sheet(usersJson);          //write the full data to a sheet
        const clickedSheet = xlsx.utils.json_to_sheet(clickedUsers)     //write users who clicked to a sheet
        const phishedSheet = xlsx.utils.json_to_sheet(phishedUsers)     //write users who were phished
        const ignoredSheet = xlsx.utils.json_to_sheet(ignoredUsers)     //write users who ignored the phish link

        const book = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(book, analyticsSheet, "ANALYTICS");
        xlsx.utils.book_append_sheet(book, rawSheet, "RAW");
        xlsx.utils.book_append_sheet(book, clickedSheet, "CLICKED THE LINK");
        xlsx.utils.book_append_sheet(book, phishedSheet, "SUBMITTED PASSWORD");
        xlsx.utils.book_append_sheet(book, ignoredSheet, "IGNORED");
        

        const fileName = timeStamp();
        const filePath = `${DIR_NAME}/static/files/${fileName}-${this.name}.xlsx`;

        xlsx.writeFile(book, filePath);

        return `/static/files/${fileName}-${this.name}.xlsx`;

    }

    

}
