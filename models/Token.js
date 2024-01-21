export class Token{
    constructor(id, email, campaign) {
        this.ID = id                        //the actual token :)
        this.email = email                  //The eamil the token was sent to.
        this.campaign = campaign            //What campaign this speicific token belongs to.
    }

    toJson() {
        return {
            id : this.ID,
            email : this.email,
            campaign : this.campaign
        }
    }

    static fromFirebase(data) {
        const id = data.id;
        const mail = data.email;
        const camp = data.campaign;

        return new Token(id, mail, camp);
    }
}