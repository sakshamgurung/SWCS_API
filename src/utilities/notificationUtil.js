const admin = require('firebase-admin');
const config = require('../config');

admin.initializeApp({
  credential: admin.credential.cert(config.fcmConfig),
  databaseURL:config.fcmURL
});

let registrationTokens = null;

const sendNotifications = (message)=>{
  console.log(message);
  admin.messaging().sendMulticast(message)
    .then((response)=>{
      const failedTokens = [];
      response.responses.forEach((resp,index)=>{
        if(!resp.success){
          failedTokens.push(registrationTokens[index]);
        }
      });
      console.log("Failed tokens list: "+failedTokens);
    });
}

const sendToAll = (msg, title, regIdArray, response)=>{
  /**
   * Creating notification type message to send
   */
  const message = {
    notification:{
      "title":title,
      "body":msg
    },
    android:{
      notification:{
        "icon":'',
        "color":'#479bf5'
      }
    }
  };

  /**
   * Grouping receiver's id into group of 500 (max limit in fcm)
   */
  if(regIdArray.length > 500){
    let folds = 0; 
    folds = regIdArray.length % 500;
    for(let i = 0; i < folds; i++){
      let start = i*500;
      let end = (i+1) *500;
      registrationTokens = regIdArray.slice(start, end);
      message['tokens'] = registrationTokens;
      sendNotifications(message);
    }
  }else{
    registrationTokens = regIdArray;
    message['tokens'] = registrationTokens;
    sendNotifications(message);
  };
  response.sendStatus(200);
}

exports.sendToAll = sendToAll;