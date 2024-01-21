export class Email{
    constructor(campID, mailID, mailTo) {
        this.campaignID = campID;       //So I can identify the campaign to update 
        this.mailID = mailID;           //This what I use to search when I receive a webhook from postmark
        this.mailTO = mailTo;           //Who this email was sent to
    }

    toJson() {
        return {
            campID : this.campaignID,
            mailID : this.mailID,
            mailTO : this.mailTO
        }
    }

    static fromFirebase(data) {
        const to = data.mailTO;
        const id = data.mailID;
        const campID = data.campID;

        return new Email(campID, id, to);
    }

}