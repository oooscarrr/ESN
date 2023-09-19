var express = require('express');
var router = express.Router();
const User = require('../db').User;

// A list of all banned usernames
var bannedUsernamesList = "about access account accounts add address adm admin administration adult advertising affiliate \
  affiliates ajax analytics android anon anonymous api app apps archive atom auth authentication avatar backup banner banners \
  bin billing blog blogs board bot bots business chat cache cadastro calendar campaign careers cgi client cliente code comercial \
  compare config connect contact contest create code compras css dashboard data db design delete demo design designer dev devel dir \
  directory doc docs domain download downloads edit editor email ecommerce forum forums faq favorite feed feedback flog follow file \
  files free ftp gadget gadgets games guest group groups help home homepage host hosting hostname html http httpd https hpg info \
  information image img images imap index invite intranet indice ipad iphone irc java javascript job jobs js knowledgebase log login \
  logs logout list lists mail mail1 mail2 mail3 mail4 mail5 mailer mailing mx manager marketing master me media message microblog \
  microblogs mine mp3 msg msn mysql messenger mob mobile movie movies music musicas my name named net network new news newsletter nick \
  nickname notes noticias ns ns1 ns2 ns3 ns4 old online operator order orders page pager pages panel password perl pic pics photo photos \
  photoalbum php plugin plugins pop pop3 post postmaster postfix posts profile project projects promo pub public python random register \
  registration root ruby rss sale sales sample samples script scripts secure send service shop sql signup signin search security settings \
  setting setup site sites sitemap smtp soporte ssh stage staging start subscribe subdomain suporte support stat static stats status store \
  stores system tablet tablets tech telnet test test1 test2 test3 teste tests theme themes tmp todo task tasks tools tv talk update upload url \
  user username usuario usage vendas video videos visitor win ww www www1 www2 www3 www4 www5 www6 www7 wwww wws wwws web webmail website websites \
  webmaster workshop xxx xpg you yourname yourusername yoursite yourdomain"
bannedUsernamesList = bannedUsernamesList.split(" ");
// A set of all banned usernames
const bannedUsernamesSet = new Set();
for (let i = 0; i < bannedUsernamesList.length; i++) {
  bannedUsernamesSet.add(bannedUsernamesList[i].toLowerCase());
}

/*
This function validates user login info
- Input: 
    username (str)
    password (str)
- Output: 
    1. If username exists and password matches the user data in DB, return success code 1
    2. If username exists but password does not match the user data in DB, return error code 2
    3. If username does not exist and username does not meet the username rule, return error code 3
    4. If username does not exist and password does not meet the password rule, return error code 4
    5. If username does not exist and both username and password meet the rule, return success code 5
*/
router.post('/validateUserInfo', async function (req, res) {
    try {
        // Username is not case sensitive
        const username = req.body.username.toLowerCase();
        // TODO: encrypt password
        const password = req.body.password;
        const data = await User.findOne({ username: username });
        if (data) {
            // User exists and password is correct
            if (data.password == password) {
                return res.send({ "status": "success", "code": 1 });
                // User exists but password is incorrect
            } else {
                return res.send({ "status": "error", "code": 2 });
            }
        }
        // User does not exist, create a new user
        // Username does not meet username rule
        if (username.length < 3 || bannedUsernamesSet.has(username)) {
            return res.send({ "status": "error", "code": 3 });
        }
        // Password does not meet password rule
        if (password.length < 4) {
            return res.send({ "status": "error", "code": 4 });
        }
        // Both username and password meet rules, return success code
        return res.send({ "status": "success", "code": 5 });
    } catch (error) {
        console.log(error);
    }
});

/*
This function creates a new user and stores user info into the DB
- Input: 
    username (str)
    password (str)
- Output: 
    A HTTP status code
*/
router.post('/createNewUser', async (req, res) => {
    try {
        const user = new User(req.body);
        const newUser = await user.save();
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('createNewUser Error: ', error);
    }
    finally {
        console.log('User Saved')
    }
});

module.exports = router;
