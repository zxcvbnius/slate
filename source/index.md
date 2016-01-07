---
title: API Reference

language_tabs:
  - java: android
  - objective_c: ios
  - http: restful

toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>
  - <a href='http://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---

# Getting Started


## Prerequisites for API v0.1.0 

* **iOS**
<br></br>

* **Android**
    - We do not support Java outside of Android at the moment.  
    - A recent version of the Android SDK  
    - We support all Android versions since API Level 14 (Android 4.0 & above).  



### Installation for iOS

- ` pod 'DUMessaging'`  
- ` pod install`  
- _TODO_  


### Installation for Android

- You can either use Maven or manually add a Jar to your project.  


1. **Maven** 
<br></br>
    *  Navigate to your build.gradle file at the app level (not project level) and ensure that you include the following:  
        ` maven { url "https://dl.bintray.com/zxcvbnius/maven"} `  
    * Add compile **'com.duolc.diuitapi:message:0.1.1'** to the dependencies of your project  
    * In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files  
<br></br>

2. **Jar** 
<br></br>
    * Download the release package and unzip  
    * Create a new project with Android Studio  
    * Copy the **diuit-api-VERSION.jar** folder into app/libs  
    * In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files  



## Initialization

* **iOS**
<br></br>

* **Android**
    - Open your main activity or the activity in which you want to integrate the update process.  
    - Add the following lines:    



```java
    public class YourActivity extends Activity {

        @Override
        protected void onCreate(Bundle savedInstanceState) {

            // Your own code to create the view
            // ...

            DiuitAPI.current = new DiuitAPI( DIUIT_APP_ID, DIUIT_APP_KEY );
        }

        // Probably more methods
    }
```  

```objective_c  
 iOS
```  

```http  
 Restful
```  


# Authentication

The User / Authentication module provide functionalities for managing user information.  


### Authentication  

Our messaging server does not directly store your users' credential. Instead, you will need to have your own account server to manager your users' credentials and to authenticate them.

After you've authenticate your user, you then encrypt a JWT access grant the user access using the EncryptionKey obtained from when registering your account, and send the JWT to us to signify that you vouch that this user is indeed logged in.

Thus, authenticating a user requires a 4 steps process.  

1. Obtain a nounce is from our API server through /1/auth/nonce API. (This can be done either by device client or by your account server)
You authenticate the user on your account server.  
2. If authentication is successful, your account server will create a JWT authentication token  
3. You then pass this authentication token to our /1/auth/login API to obtain a session token. (Thie can be done either by device client or by your account server)  
4. The session token is set in the X-Diuit-Session-Token header for all future API calls that requires a specific user session.

Please note that the EncryptionKey should be kept private on your account server, and should not be stored on your client app. If the EncryptionKey is leaked, anyone can forge a user-login to the messaging system. If you suspect that an encryption key has been leaked, please genereate a new EncryptionKey on [http://www.diuit.net](http://www.diuit.net) and revoke the old one.  


### 1. Obtaining Authentication Nonce

The first step of authentication requires obtaining a unique nonce from our server. This nounce is used to prevent replay-attack of the JWT token.
To obtain the nonce from our server, send a GET request to the /1/auth/nonce API. 
<br></br>
<aside class="note">
        curl -X GET \  
            -H "X-Diuit-Application-Id: ${APPLICATION_ID}" \  
            -H "X-Diuit-API-Key: ${REST_API_KEY}" \  
            https://api.diuit.net/1/auth/nonce  
</aside>
<br></br>

The response body is a JSON object containing the `nonce` key.
<aside class="note">
    {
        "nonce": "123asdf123asdf12321adf",
    }
</aside>


### 2. Authenticate User Credential On Your Server.  

The real user authentication is performed on your own server. Perform any authentication check you've implement to authenticate the user loggining in.

### 3. Generate JWT Autentiction Token  

If the user's identity is verified, your server should generate a JWT token with the following header:
<br></br>
<aside class="note">
    {  
        "typ": "JWT",  
        "alg": "RS256"  
        "cty": "diuit-eit;v=1"  
        "kid": ${EncryptionKeyId}  
    }
</aside>
<br></br>

and the following claim body:
<br></br>
<aside class="note">
{
"iss": ${APPLICATION_ID}  
"sub": ${UNIQUE_USER_ID}  
"iat": ${CURRENT_TIME_IN_ISO8601_FORMAT}  
"exp": ${SESSION_EXPIRATION_TIME_IN_ISO8601_FORMAT}  
"nce": ${AUTHENTICATION_NONCE}  
}
</aside>
<br></br>


and encrypt the whole thing with your EncryptionKey obtained when registering for our account.  
Take note that you put the EncryptionKeyId, not EncryptionKey itself in "kid" field. The JWT header itself is not encrypted, so do not put your encryption key here.  
The resulting JWT token should then be passed back to the client app to indicate authentication successful.  


### 4. Obtaining Session Token with Authentication Token

With the JWT token generated, you then POST to the /1/auth/login API with the auth-token parameter set to the JWT token to obtain a session token for the user.  
This step can be done either on the server side or client side depending on your own system architecture.  
But please note that when loggin in, you will also need to provide the deviceId field to uniquely identify the current device that the user is logging in from. If on a web device, please generate a unique UUID to link with the current web session.  
And if your wish to enable push notification on mobile devices, please pass two additional fields: platform field to indicate what is the push platform to be used (can be one of "gcm", "ios_sandbox", "ios_production"), and a pushToken field to indicate the pushToken specific to the push platform.  

<br></br>
<aside class="note">
curl -X POST \  
-H "X-Diuit-Application-Id: ${APPLICATION_ID}" \  
-H "X-Diuit-API-Key: ${REST_API_KEY}" \  
-H "Content-Type: application/json" \  
-d '{"authToken":"putyourtoken", "deviceId": "putyourdeviceid", "platform": "gcm", "pushToken": "putdevicepushtoken"}' \  
https://api.diuit.net/1/auth/login  
</aside>
<br></br>

If successful, the response will be a JSON object contains the `sessionToken` key that should be set in future API calls as `X-Diuit-Session-Token` header to authenticate the user.  


### Authenticate With Socket.IO  
After authenticate the user, and obtaining the session-token, you can start the real-time messaging session by opening a Socket.IO connection to our `http://www.diuit.net` server.  
After the socket.io session is connected, you have 15 seconds to emit a "authenticate" message with payload {authToken: ${SESSION_TOKEN}} to authenticate the user.  
The server should respond with a JSON payload containing your device info to signify login success.  
After which you can use the other Socket.IO APIs.  



# Integration

Diuit is a powerful tool that lets you add in-app messaging with very little overhead. Diuit can work with any existing User Management system, and includes features such as querying, Message delivery and read receipts, Conversation metadata, and typing indicators.  


## Listing Chat Rooms

To list all chat-rooms you are currently joined in, emit a "chats/list" message, with empty payload.  
The server should respond with with a list of all chats you are currently joined in.  

```java  
    // In Android, if you have already authenticated your devices, you can get all your chatroom easily.
 
    DiuitAPI.current.listChats(new DiuitAPICallback<ArrayList<DiuitChat>>()
    {
        @Override
        public void onSuccess(final ArrayList<DiuitChat> chatArrayList)
        {
            // if success, retrun chatArrayList
        }
 
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });

```

```objective_c
```


```http  
```

## Create a Chat Room  

To create a chat-room, you emit a "chats/creat" message, with the following payload:

<aside class="note">

{  
    members: [ ${USER_ID_1}, ${USER_ID_2} ..]  
    whiteList: [ ${USER_ID_1} ... ]  
    meta: { ${ANY_CHAT_ROOM_SPECIFIC_META_DATA} }  
}  

</aside>
<br></br>

For `members` field, put the ids of all the people you wish to include the chatroom as an array. (Note that the ID shold be the sub fields you passed in when you create your JWT token)  
How you obtain these user ID are application specific, and is not the concern of our messaging API. For example, for a chatting application, you generally will have a query API on your own account server, for your user to query their own friends / other contactst they wish to message to.  
For a IOT application, you might have a list of pre-written contacts in your firmware instead. Our messaging API makes no assumption about what kind of application you are developing.  
The meta field is a general purpose field for you to store any chat-room specific information. For example, you can store the name of your chat-room, a globally shared notes for your chat-room, a base64 encoded small icon for your chatroom, etc. Again, our messaging makes no assumption about what kind of application you are developing, so it's up to you on what you need to store along with the chat-room's meta data.  
For `whiteList` field, you can leave it `null` to indicate that everyone is allowed to join, or include all the user IDs that are allowed to join in the room.  


```java
    
    // @params serialOfUsers : put all users you want to join init this string array
    // @params meta : you can put attribute of the chat, ex, {'name' : 'this is my new chatroom'}
    DiuitAPI.current.createChat(String[] serialOfUsers, JSONObject meta, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onSuccess(final DiuitChat diuitChat)
        {
            // If success, will return a DiuitChat object
        }

        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
                // if failure, it will return error code and result        
        }
    });

```


```objective_c
```


```http
```


## Join a Chat Room

To join a chat-room, you emit a "chats/join" message, with the following payload:

<aside class="note">

{  
chatId: ${CHATROOM_ID}  
}  

</aside>
<br></br>


```java

    //@param chatId , the id of the chat you want to join
    DiuitAPI.current.joinChat(int chatId, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result                
        }
        @Override
        public void onSuccess(final DiuitChat diuitChat)
        {
            // if success, it will return the DiuitChat object
        }
    });
```

```objective_c
```


```http
```




## Leave a Chat Room

To leave a chat-room, you emit a "chats/leave" message, with the following payload:

<aside class="note">
{  
chatId: ${CHATROOM_ID}  
}  
</aside>
<br></br>


```java

    //@param chatId , the id of the chat you want to join
    DiuitAPI.current.leaveChat(diuitChat, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result        
        }
        @Override
        public void onSuccess(final DiuitChat diuitChat)
        {
            // if success, it will return the DiuitChat object
        }

    });
```

```objective_c
```


```http
```


## Updating Chat Room Meta Info

To update the chat-room's infomation, emit a "chats/meta/update" message, with the following payload:

<aside class="note">
{  
    chatId: ${CHATROOM_ID}  
    meta: { ${CHATROOM_META} }  
}  
</aside>
<br></br>


```java

    // create new meta for updating the attribute of the chat 
    JSONObject newMeta = new JSONObject();
    newMeta("name", newName);

    DiuitAPI.current.updateChat(diuitChat, newMeta, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result  
        }

        @Override
        public void onSuccess(DiuitChat diuitChat)
        {
            // if success, it will return the DiuitChat object            
        }
    });

```

```objective_c
```


```http
```



## Updating Chat Room White List

To update the chat-room's white list info, emit a "chats/whiteList/update" message, with the following payload:  

<aside class="note">
{ 
    chatId: ${CHATROOM_ID}  
    whiteList: [ ${USER_ID_1} ]   
}  
</aside>
<br></br>

Note, to clear whiteList to `null`, pass a `null for thewhiteList` field.  
And that removing a persom from the white list doesn't kick a person from the chat-room if he's already joined to the chat room.  


```java

    // @param serialsOfUsers : all users who you want to set into this chat whitelist
    // @param diuitChat : the chat which you want to update 
    DiuitAPI.current.updateWhiteList(DiuitChat diuitChat, String[] serialsOfUsers, 
                    new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result  
        }

        @Override
        public void onSuccess(DiuitChat diuitChat)
        {
            // if success, it will return the DiuitChat object            
        }
    });

```

```objective_c
```


```http
```


## Kick a user from Chat Room

To kick a user from the chat room, emit a "chat/kick" message, with the following payload  

<aside class="note">
    {  
        chatId: ${CHATROOM_ID}  
        userId: ${TARGET_USER_TO_KICK}  
    }  
</aside>
<br></br>

Note that kicking a user from the chat room doesn't change the whiteList status. So if the user is in the white list of the chat room, he can join back to the room himself.  
To completely ban a user from the chat room, emit a "chat/whiteList/update" first, before kicking them out.  '

```java

    DiuitAPI.current.kick(diuitChat, diuitUser, new DiuitAPICallback<JSONObject>()
    {
        @Override
        public void onSuccess(JSONObject resultObj)
        {
            // if success, it will return result
        }

        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });
```

```objective_c
```


```http
```


## Receiving a Message

When a user send a message to the chatroom you are joined in. You will receive a "message" event.  
You should listen for the event to receive real-time messages. The message will have the following format:  

<aside class="note">
{  
    chatId: ${CHATROOM_ID},  
    data: ${SOME_DATA}  
    mime: ${DATA_MIME_TYPE}  
    encoding: ${DATA_ENCOIDNG}  
    meta: {$USER_SPECIFIC_META_FIELD}  
}  
</aside>
<br></br>

For text message, the mime type will be text/plain and the encoding will be utf8, and the data will be the text message itself.  
For rich media messages, the mime type will be the mime type of the media, and the data will contain a url pointing to the rich media itself.  

```java
    // If you want to receive messages , you have to register receiving listener with your object  
    // This object could be Activity, Fragment , or any kind of object   
    // Once someone send you a message , you would get these in the callback
    
    DiuitAPI.current.registerReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

    // Before you leave the activity, or change the object to be `NULL`, you have to unregister this listener  

    DiuitAPI.current.unregisterReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

```


```objective_c
```


```http
```




## Send a Text Message

To send a message to a chat room, emit a "message/create" message, with the following payload  

<aside class="note">
    {
        chatId: ${CHATROOM_ID},
        data: ${SOME_TEXT_TO_SEND}
        mime: 'text/plain'
        encoding: 'utf8'
        meta: {$USER_SPECIFIC_META_FIELD}
    }
</aside>
<br></br>

> There three main type of message , text, photo, and file.
> According different type, you have to call differen API.
> Example, if you want to send a text to your friends:

```java

    // @param text , your text message string
    // @param chat, choose a chat which you want to send
    DiuitAPI.current.sendToChat(DiuitChat chat, String text, new DiuitAPICallback<DiuitMessage>()
    {
        @Override
        public void onSuccess(final DiuitMessage diuitMessage)
        {
            // if success, it will return your DiuitMessage
        }

        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result                
        }
    });
```

```objective_c
```


```http
```


## Send a Rich Media Message

To send a rich media message to a chat room, emit a "messages/create" message, with the following payload  

<aside class="note">
    {
        chatId: ${CHATROOM_ID},  
        data: ${BASE64_ENCODED_DATA}  
        mime: ${MIME_TYPE_OF_DATA}  
        encoding: 'base64'  
        meta: {$USER_SPECIFIC_META_FIELD}  
    }
</aside>
<br></br>


> Also, you can use those API to send your photos and files to your chat

```java

    // @param bitmap , the bitmap of your photo
    // @param chat, choose a chat which you want to send
    DiuitAPI.current.sendToChat(DiuitChat chat, Bitmap bitmap, new DiuitAPICallback<DiuitMessage>(){...})  

```

```objective_c
```


```http
```

> If you want to send your file , just call this API:

```java

    // @param file , the File object of your file
    // @param chat, choose a chat which you want to send
    DiuitAPI.current.sendToChat(DiuitChat chat, File file, new DiuitAPICallback<DiuitMessage>(){...})

```

```objective_c
```


```http
```

> Remember , each message has file size limit <= 5MB


## List Messages In a Chat Room 

To list messages in a chat room, emit a "messages/list" message, with the following payload  

<aside class="note">
    {  
        chatId: ${CHATROOM_ID},  
        page: ${PAGE_NUMBER_TO_GET},  
        count: ${MESSAGES_PER_PAGE},  
        before: ${TIMESTAMP_IN_SEC},  
    }
</aside>
<br></br>

Response will contains `count` number of message before the timestamp specified in `before` field, skipping over `page` * `count` number of messages. (In another word, page start at 0)  
Messages are returned in reverse chronological order, with the newest message returned first.  
So, in general, you call the API with the current timestamp to obtain all the latest messages, and required, call the API with an older timestamp to obtain older messages.  


```java

    // @param chat , the chat you want to query
    // @param before, before the timestamp, UTC+0
    DiuitAPI.current.listMessagesInChat(DiuitChat chat, Date before, int count, int page, new DiuitAPICallback<ArrayList<DiuitMessage>>()
    {
        @Override
        public void onSuccess(final ArrayList<DiuitMessage> diuitMessageArrayList)
        {
            // if success, it will return message arraylist
        }
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });

```

```objective_c
```


```http
```


## Mark a Message as being Read

To mark a message as being read, emit "messages/markAsRead" message, with the following payload.  

<aside class="note">
    {
        messageId: ${MESSAGE_ID}  
    }
</aside>
<br></br>

The message will be marked as read by the currently logged in user.  

```java

    // @param message, the message which you want to mark as readed
    DiuitAPI.current.markAsRead(DiuitMessage message, callback()
    {
        @Override
        public void onSuccess(final JSONObject resultObj)
        {
            // if success, it will return result
        }
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });

```

```objective_c
```


```http
```

## Appendex

System Message Definitions

Type | Payload Keys
---------- | -------
user.left | userId
user.joined | userId
whiteList.updated | whiteList
user.kicked | userId
meta.updated | meta



# Models

Diuit message api models are defined by implementing something very similar to [socket.io](http://socket.io)   
Simply extend our DiuitObject class and let the Diuit annotations processor generate proxy classes.  
In out api, there are 4 models you might to know:  

### **DiuitUser**  
### **DiuitDevice**  
### **DiuitChat**  
### **DiuitMessage**  





































