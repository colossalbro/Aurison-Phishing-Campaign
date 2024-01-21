export class AurisonUser {
    constructor(title, fname, lname, email, org) {
        this.title = title;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.org = org;
        this.opened_email = false;
        this.clicked_link = false;
        this.phished = false;
        this.sent_email = false;
    }

    static fromXlsx(jsonObj) {
        var {Title, Firstname, Lastname, Email, Organization} = jsonObj

        return new AurisonUser(Title, Firstname, Lastname, Email, Organization);
    }

    static fromFirebase(jsonObj) {
        
        var {Title, First_Name, Last_Name, Email, Organization} = jsonObj;

        let user = new AurisonUser(Title, First_Name, Last_Name, Email, Organization);

        user.clicked_link = jsonObj.Clicked_Link;
        user.opened_email = jsonObj.Opened_Email;
        user.phished = jsonObj.Submitted_Pass;
        user.sent_email = jsonObj.Sent_Email;

        return user;
    }

    toJson() {
        //majorly for the excel generator thing.
        return {
            "Title" : this.title,
            "First_Name" : this.fname,
            "Last_Name" : this.lname,
            "Email" : this.email,
            "Organization" : this.org,
            "Sent_Email" : this.sent_email,
            "Opened_Email" : this.opened_email,
            "Clicked_Link" : this.clicked_link,
            "Submitted_Pass" : this.phished
        }
    }

}