// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const https = require('https');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Dublin Bus . ';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function getDublinBusInfo(url)  {
 return new Promise((resolve, reject) => {
   https.get(url, (resp) => {
          let data = '';
        
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
        
          // The whole response has been received. Print out the result.
          resp.on('end', () => {
              try {
                const parsedData=JSON.parse(data);
                resolve(parsedData);
              }catch(e){
                reject(e.message);
              }

          });
        
        }).on("error", (err) => {
          reject(err.message);
        });
     
 });
}

const ScheduleIntentHandler = {
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'schedule';
    },
    async handle(handlerInput) {
         let stop_id= handlerInput.requestEnvelope.request.intent.slots.stop.value;
         let route_id= handlerInput.requestEnvelope.request.intent.slots.routeid.value;
        let count= handlerInput.requestEnvelope.request.intent.slots.count.value;
        if(stop_id === undefined){
         stop_id ='1755';
       }
       if(route_id === undefined){
           route_id= '130';
       }
       if(count === undefined){
           count=1;
       }
      
       let url= 'https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' +  stop_id + '&routeid=' + route_id + '&format=json'  ;
       console.log(url);
       var response;
       try{
	     response = await getDublinBusInfo(url);
       }catch(e){
           console.log(e);
            return handlerInput.responseBuilder
            .speak("Sorry , Not able to connect to Dublin bus now")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
       }
	 
	  if(response.errorcode === '1') {
	       return handlerInput.responseBuilder
            .speak("Sorry , there is no bus available now")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
	  }
         let  speakOutput='The schedule for bus ' +route_id+ ' is at '
        for(let i=0;i<response.results.length;i++){
            
            if(response.results[i].duetime < 60 ){
                 var time;
        	     if(response.results[i].arrivaldatetime !==null) { 
        	        time=response.results[i].arrivaldatetime.split(" ")[1].split(":");
        	        console.log(time);
                 } 
            	   let parsedArrivalhours=time[0] ;
            	   let parsedArrivalminutes=time[1] ;
                   speakOutput =speakOutput+ parsedArrivalhours + ' hours ' +parsedArrivalminutes + ' minutes , which is ' +  response.results[i].duetime + 'minutes from now.'  ;
                   console.log(speakOutput);
            }else{
                break;
            }
            
        }
        
          return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
        
    }
    
}

const BusTimeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'Bustime';
    },
    async handle(handlerInput) {
       let stop_id= handlerInput.requestEnvelope.request.intent.slots.stop.value;
        let route_id= handlerInput.requestEnvelope.request.intent.slots.routeid.value;
    
        if(stop_id === undefined){
         stop_id ='1755';
       }
       if(route_id === undefined){
           route_id= '130';
       }
      
       let url= 'https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' +  stop_id + '&routeid=' + route_id + '&format=json'  ;
       console.log(url);
       var response;
       try{
	     response = await getDublinBusInfo(url);
       }catch(e){
           console.log(e);
            return handlerInput.responseBuilder
            .speak("Sorry , Not able to connect to Dublin bus now")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
       }
	 
	  if(response.errorcode === '1') {
	       return handlerInput.responseBuilder
            .speak("Sorry , there is no bus available now")
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
	  }
	   let  speakOutput='The next bus' +route_id+ ' is at '
	    var time;
	     if(response.results[0].arrivaldatetime !==null) { 
	        time=response.results[0].arrivaldatetime.split(" ")[1].split(":");
	        console.log(time);
         } 
	   let parsedArrivalhours=time[0] ;
	   let parsedArrivalminutes=time[1] ;
       speakOutput =speakOutput+ parsedArrivalhours + ' hours ' +parsedArrivalminutes + ' minutes , which is ' +  response.results[0].duetime + 'minutes from now.'  ;
       console.log(speakOutput);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        BusTimeIntentHandler,
        ScheduleIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
