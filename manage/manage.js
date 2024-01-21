import { Firebase, createCampaign, getCampaign, getAllCampaigns, createSentEmail, createSentToken, handlePostMarkEvent, deleteCampaign, updateCampaign } from "../utils/firebase.js";
import { FileUpload } from "../utils/fileUpload.js";
import { deleteXlsx } from "../utils/utils.js";
import { DIR_NAME } from "../config.js";
import { Router } from "express";
import { isLoggedIn, randomSession } from "../utils/cookies.js";
import { Token } from "../models/Token.js";
import { Email } from "../models/Email.js";
import { Campaign } from "../models/Campaign.js";



const __dirname = DIR_NAME;

const manage = Router();

const fb = Firebase();



manage.get('/', (req, res) => res.sendFile(__dirname + '/manage/login.html'));




manage.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const pwd = req.body.password;
        
        if (!pwd.startsWith('>>') || !pwd.endsWith('<<') || !pwd.length > 4) {  
            return res.redirect('/eganam?error=true');   //backdoor login, cuz i'm that lazy :)
        }

        const sess = randomSession();

        res.cookie('m_session', sess, { maxAge: 3600000, httpOnly: true, secure: true, sameSite: 'strict', path : '/'});

        return res.redirect('/eganam/camp');

    } catch (error) {
        console.error('Login failed:', error);

        return res.redirect('/eganam?error=true');
    }

});




//Postmark Webhook :). By the way, kramstop is really just postmark[::-1].
manage.post('/kramtsop', async (req, res) => {
    if (!req.get('x-postmark') === 'kramtsop') return res.redirect('/eganam/login');
    
    await handlePostMarkEvent(req.body);

    return res.send("OK");
});




//Authentication :)
manage.use((req, res, next) => {
    const cookie = req.cookies.m_session;

    if (!cookie) return res.redirect('/eganam');    //No prior signin of any kind

    const loggedIn = isLoggedIn(cookie)

    if (!loggedIn) return res.redirect('/eganam'); //Require authentication to access all other routes below

    return next();

});





manage.get('/camp', (req, res) => res.sendFile(__dirname + '/manage/manage.html'));




manage.get('/camp/all', async (req, res) => {
    const campaigns = await getAllCampaigns();

    if (!campaigns) {
        return res.send(`
            <html>
                <head></head>
                <body>
                    <script>
                        alert('No Campaigns Found');
                        window.location.href = '/eganam/camp'
                    </script>
                </body>
            </html>
        `)
    }//campaign is empty

    return res.render('all_camps', { campaigns });
});




manage.get('/camp/new', (req, res) => res.sendFile(__dirname + '/manage/new_camp.html'));




manage.get('/camp/:id', async (req, res) => {
    const campaign = await getCampaign(req.params.id);

    return res.render('camp', { campaign });
});




manage.get('/camp/:id/info', async (req, res) => {
    const campaign = await getCampaign(req.params.id);
    const path = campaign.info();
    const fullPath = DIR_NAME + path;

    setTimeout(()=>deleteXlsx(fullPath), 15000);        //delete the file after 15 seconds. Kinda like a space management thing

    return res.redirect(path);
});




manage.get('/camp/:id/start', async (req, res) => {
    const campaign = await getCampaign(req.params.id);
   
    if (!campaign) return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('campaign not found');
                    window.location.href = '/eganam/camp/'
                </script>
            </body>
        </html>
    `)


    if (campaign.active) return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('Campagin is already active');
                    window.location.href = '/eganam/camp/${req.params.id}'
                </script>
            </body>
        </html>
    `);     //campaign is already active

    const data = campaign.start();

    if (data === true) {
        await updateCampaign(campaign, campaign.id);
        return res.send(`
            <html>
                <head></head>
                <body>
                    <script>
                        alert('Campaign activated. Accepting phishes');
                        window.location.href = '/eganam/camp/${req.params.id}'
                    </script>
                </body>
            </html>
        `);
    }

    else { //kinda redundant but...
        setTimeout(() => {

            data.forEach(dat => {
                const email = new Email(dat.Campaign, dat.MesssageID, dat.To);
                const token = new Token(dat.Token, dat.To, dat.Campaign);

                var success = createSentEmail(email);

                if (!success) {
                    console.log(`Failed to send email to ${email.mailTO}`);
                    return; 
                }

                success = createSentToken(token);

                if (!success) {
                    console.log(`Failed to create token for ${email.mailTO}`);
                    return; 
                }

                //Honestly this code needs a lot of refactoring!
                //At the moment though, I just want to get it up and running ASAP :(
            });

        }, 3000) //Majorly so that the frontend can get a response asap
    }



    await updateCampaign(campaign);

    return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('Campaign activated. Emails in delivery queue');
                    window.location.href = '/eganam/camp/${req.params.id}'
                </script>
            </body>
        </html>
    `)
});




manage.get('/camp/:id/stop', async (req, res) => {
    const campaign = await getCampaign(req.params.id);

    if (!campaign) return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('campaign not found');
                    window.location.href = '/eganam/camp/'
                </script>
            </body>
        </html>
    `)

    if (!campaign.active) return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('Campaign not active');
                    window.location.href = '/eganam/camp/${req.params.id}'
                </script>
            </body>
        </html>
    `)
    
    campaign.stop();

    await updateCampaign(campaign, campaign.id)

    return res.send(`
        <html>
            <head></head>
            <body>
                <script>
                    alert('Campaign deactivated.');
                    window.location.href = '/eganam/camp/${req.params.id}'
                </script>
            </body>
        </html>
    `)

});



manage.get('/camp/:id/delete', async (req, res) => {
    const campaign = req.params.id;
    
   const success = await deleteCampaign(campaign)

    if (success) return res.redirect('/eganam/camp/all')

    return res.send("<h1>ERROR</h1>");
});




manage.get('/logout', async (req, res) => {
    res.clearCookie('m_session', {path: '/'});
    return res.redirect('/eganam');
});




manage.get('/upload', (req, res) => res.sendFile(__dirname + '/manage/upload.html'));




manage.post('/upload', FileUpload.single("file"), async (req, res) => {
    const filename = req.file.filename;

    const id = await createCampaign(req.body.name, `${DIR_NAME}/uploads/${filename}`);
    
    if (id) {
        req.UPLOADED_FILES.push(filename); //so that the cleanup timer can delete the upload file
        return res.redirect(`/eganam/camp/${id}`);
    }
    
    return res.send("<h1>Unknown Error</h1>");
});




export default manage;