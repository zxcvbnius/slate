---
title: API Reference

language_tabs:
  - java: Android
  - objective_c: iOS Obj-C
  - swift: iOS Swift
  - shell: REST / Socket.IO

toc_footers:
  - <a href='#'>Want to develop Diuit API?</a>
  - <a href='mailto:benchang@diuit.com'>Contact us to build your application</a>

includes:
  - errors

search: true
---

# Getting Started

Diuit provides a simple and powerful API to enable real-time communication in web and mobile apps, or any other Internet connected device.
This document provides a guide on how to get you start integrating and interacting with Diuit API.  
This document update: 2016-01-18 10:00:00+00

## Prerequisites
### iOS

- Support iOS 8.0+
- OS X support coming soon :)

### Android

- We do not support Java outside of Android at the moment.
- A recent version of the Android SDK
- We support all Android versions since API Level 14 (Android 4.0 & above).

## Installation

```objective_c
platform :ios, '8.0'
use_frameworks!

target 'MyApp' do
  pod 'DUMessaging'
end
```

```swift
platform :ios, '8.0'
use_frameworks!

target 'MyApp' do
  pod 'DUMessaging'
end
```

### iOS

Use Cocoapods to retrieve the framework

1. Execute command `pod init` under your Xcode project directory to create a Podfile for the project
2.  Make your Podfile look like as right：
3. Run `pod install` to install the framework and dependencies
4. Make sure to always open the Xcode workspace instead of the project file when building your project:

    `open MyApp.xcworkspace`

### Android

    You can either use Maven or manually add a Jar to your project.

**Maven**

1.  Navigate to your build.gradle file at the app level (not project level) and ensure that you include the following:

    ` maven { url "https://dl.bintray.com/duolc/maven"}`

2. Add compile **'com.duolc.diuitapi:message:0.2.1'** to the dependencies of your project
3. In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files

**Jar**

1. Download the release package and unzip
2. Create a new project with Android Studio
3. Copy the **diuit-api-VERSION.jar** folder into app/libs
4. In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files

## Setup

> Example  

```objective_c
    #import <DUMessaging/DUMessaging-Swift.h>

    -(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

        DiuitAPI.current = [[DiuitAPI alloc] initWithAppId:@"YOUR_APP_ID" appKey:@"YOUR_APP_KEY"];
        return YES;
    }
```

```swift
    import DUMessaging

    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        DiuitAPI.current = DiuitAPI(appId: "YOUR_APP_ID", appKey: "YOUR_APP_KEY")
        return true
    }
```

```java
    public class YourActivity extends Activity {

        @Override
        protected void onCreate(Bundle savedInstanceState) {

            // Your own code to create the view
            // ...

            DiuitMessagingAPI.set( DIUIT_APP_ID, DIUIT_APP_KEY );
        }

        // Probably more methods
    }
```

### iOS

- Import `DUMessaging` into your **AppDelegate.m** or **AppDelegate.swift**

### Android

- Open your main activity or the activity you’d like to integrate the updated process.


### RESTful

Note that when sending an API commands, set the `x-diuit-application-id` and `x-diuit-api-key` headers with your `DIUIT_APP_ID` and `DIUIT_APP_KEY` respectively.

```shell
curl -X GET \
  -H "x-diuit-application-id: ${DIUIT_APP_ID}" \
  -H "x-diuit-api-key: ${DIUIT_APP_KEY}" \
  https://api.diuit.net/${API_END_POINT}
```

# Authenticating User

In order to let a user send and receive messages, you must authenticate them first. Diuit will accept any unique string as a User ID (UIDs, email addresses, phone numbers, usernames, etc), so you can use any new or existing User Management system.  

Our messaging server does not directly store your users’ credential. Instead, you will need to have your own account server to manager your users’ credentials and to authenticate them for our messaging server.  

After you’ve authenticated your user, you then encrypt a JWT token using the **Encryption Key** obtained from us when you signed up for your account.  

The JWT contains a grant telling us which user is allowed access to the messaging server and how long the grant is effective.  

Thus, authenticating a user on our messaging server is a 4-step process.  

The following description is RESTful by natural, so we do not need to provide SDK APIs for the following calls.  


1. Obtain a random **nonce** from our messaging server through `/1/auth/nonce` API.
This nonce is used to prevent replay attack on our messaging server, and prevent the
nonce being leaked to a malicious user.

    Note that this step can be performed either by your messaging clients or by your account server, which depends on your system architecture.

2. With the nonce at hand, you authenticate your client on your account server using whatever method you like.

    If the authentication is successful, your account server will create a JWT authentication token granting the authenticated user who accesses to our messaging server.

3. You should then call our `/1/auth/login` API using the JWT token as the parameter
to obtain a **session token**.

    Note that this step can also be done either on your messaging clients side or on your account server, which depends on your system architecture.

4. With the session token on hand, the messaging client will use it as the
value for the **X-Diuit-Session-Token** header** for all future API calls that
requires a specific user session.

    Please note that the **Encryption Key** should be kept private on your account server, and should not be stored on your client devices, unless you have security measures ensuring that the key can be kept secret. (For Android / iOS clients, this is impossible. There are many ways of rooting devices, and storing your encryption key at iOS/Android client devices will make your system vulnerable to attack.)

    If you suspect that your encryption key has been compromised, please reissue a new one on [http://www.diuit.net](http://www.diuit.net) and revoke the old key.

### 1. Obtaining Authentication Nonce

The first step of authentication requires you to obtain a random nonce from our messaging server. This nonce is used to prevent replay-attack of the JWT token.

To obtain the nonce from our server, send a GET request to the `/1/auth/nonce` endpoint.

```shell
curl -X GET \
  -H "x-diuit-application-id: ${DIUIT_APP_ID}" \
  -H "x-diuit-api-key: ${DIUIT_APP_KEY}" \
  https://api.diuit.net/1/auth/nonce
```

The response body is a JSON object containing the `nonce` key.

<aside class="note">
    {
      "nonce": "123asdf123asdf12321adf",
    }
</aside>

### 2. Authenticate User On Your Account Server

The actual user authentication is performed on your own server. Performing any authentication check you’ve implemented to authenticate the user who logs in.

### 3. Generate JWT Token

If the user’s identity is verified, your server will generate a JWT token with the following header:

<aside class="note">
    {
      "typ": "JWT",
      "alg": "RS256"
      "cty": "diuit-eit;v=1"
      "kid": ${EncryptionKeyId}
    }
</aside>

...and with the following claim body:

<aside class="note">
    {
      "iss": ${DIUIT_APP_ID}
      "sub": ${UNIQUE_USER_ID}
      "iat": ${CURRENT_TIME_IN_ISO8601_FORMAT}
      "exp": ${SESSION_EXPIRATION_TIME_IN_ISO8601_FORMAT}
      "nce": ${AUTHENTICATION_NONCE}
    }
</aside>

...  then encrypt the whole thing with your **Encryption Key** obtained when registering for your account.

Note that you can put anything in the "sub" field, as long as you can co-relate this to the user on your system. Our messaging server will use this field to identify this user.

In the "exp" field, you can specify when this grant will be expired. This field controls for how long the session token generated in the next step will be valid.

Setting this to a relative short value makes the system more secure; leaking a session token will have limited damage. But the drawback is that you will have to re-authenticate your users every so often.

Setting this to a long value can also be useful for Internet of Things (IoT) applications, because you are very confident that the device will not be hacked. You can pre-generate your session token, and set a extremely long expiration date to effectively make the device always authenticated. But in this case, you will have to ensure that the session token is never leaked. (The session token will essentially behaves like a randomly generated password in this case).

In the "kid" field, note to put Encryption Key ID, not **Encryption Key** itself. The JWT header itself is not encrypted, so never put any private data in the JWT header.
The JWT header itself is not encrypted, so never put any private data in the
JWT header.

### 4. Login to Messaging Server

With the JWT token generated, you then POST to the `/1/auth/login` API with the **auth-token** parameter set to the JWT token to obtain a session token for the user.

This step can be done either on the server side or client side. It depends on your own system architecture. But please note that when logging in, you will also need to provide the **deviceId** field to uniquely identify the current device that the user is logging in.

If you are using a web platform, please generate a unique UUID to link with the current web session. (And possibly store the UUID in local storage / cookie).

If your wish to enable push notification on mobile devices, please pass two additional fields: **platform** to indicate what is the push platform to be used (valid values are one of "gcm", "ios_sandbox", "ios_production"), and **pushToken** field to indicate the pushToken specific to the push platform.



```shell
curl -X POST \
  -H "x-diuit-application-id: ${DIUIT_APP_ID}" \
  -H "x-diuit-api-key: ${DIUIT_APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"authToken":${JWT_TOKEN}, "deviceId": ${DEVICE_ID}, "platform": ${PUSH_PLATFORM}, "pushToken": ${PUSH_TOKEN}' \
  https://api.diuit.net/1/auth/login
```

If successful, the response will be a JSON object contains the `session` key that should be set in future API calls as `x-diuit-session-token` header to authenticate the user.

<aside class="note">
    {
      "session": "123asdf123asdf12321adf",
      "userId": ${USER_ID}
      "deviceId": ${DEVICE_ID}
    }
</aside>

# Real-time Communication

Diuit is a powerful API that enables you to add in-app messaging with very little overhead. It can work with any existing User Management system, and includes features such as querying, message delivery, read receipts, conversation metadata, and typing indicators.

## Authentication for Socket.IO

For iOS and Android, we have completed the authentication for you in SDK; for direct Socket.IO interface, you will start the real-time messaging session by opening a Socket.IO connection to our server `http://www.diuit.net`.

After the Socket.IO session is connected, you emit a `authenticate` message
with payload

<aside class="note">
    {
      "authToken": ${SESSION_TOKEN}
    }
</aside>

to authenticate the user.

The server should respond with a JSON payload containing your device info to signify the log-in is successfully completed, and then you can start using other Socket.IO APIs.

If you fail to send an authenticated message within 15 seconds, the connection will be terminated by our server automatically.

Upon re-connection, you should repeat the authentication process to ensure you
are properly authenticated and call other APIs.

## Listing Chat Room


> Example  

```java
    // In Android, if you have already authenticated the user’s device, you can easily list all the chat room.

    DiuitMessagingAPI.listChats(new DiuitAPICallback<ArrayList<DiuitChat>>()
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

[DiuitAPI.current listChats:^(NSInteger statusCode, id result) {
    if (statusCode == 200) {
        // if statusCode return 200, then you will get the result as @[DUChat]. Otherwise you will get error message in result
    }
}];
```

```swift

DiuitAPI.current?.listChats(){ code, result in
    if code == 200 {
        // if statusCode return 200, then you will get the result as [DUChat]. Otherwise you will get error message in result
    }
}
```

```shell
    // Emit the "chats/list" message to server,
    // with no params, and server will respond with
    {   
        "chats": [...array of chats...]
    }

```

Diuit provides convenient and flexible features for users to communicate with each other. It can be real-time one-on-one or group messaging, on-line forum, or review system that we see in modern Internet services. The concept "Chat Room" means the ongoing conversation that a user is currently involving. Diuit API allows you to list and create chat room for users and let your users join or leave a chat room.


## Create Chat Room

Users can start a conversation by creating a chat room. Use the following command to create a chat room and generate a list of people who are in the chat room.

>Example  

```java

    // @params serialOfUsers : put all the users you want to join into this string array
    // @params meta : you can put attribute of the chat, ex, {'name' : 'this is my new chat room'}

    DiuitMessagingAPI.createChat(ArrayList<String> serials, JSONObject meta, new DiuitAPICallback<DiuitChat>()
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
// @[USER_SERIALS] : put all users' serial you want to join in this NSArray of NSString
// @{YOUR_META} (Optional) : any meta data you want to append on this chat room, as long as it's an NSDictionary

[DiuitAPI.current createChat:@[USER_SERIALS] meta:@{YOUR_META} done:^(NSInteger statusCode, id result) {
if (statusCode == 200) {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}];
```

```swift
// [USER_SERIALS] : put all users' serial you want to join in this NSArray of NSString
// [YOUR_META] (Optional) : any meta data you want to append on this chat room, as long as it's an NSDictionary

DiuitAPI.current?.createChat([USER_SERIALS], meta: [YOUR_META]) { code, result in
if code == 200 {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}
```

```shell
    // Emit the "chats/chreate" message to the server
    // with the following parameters:
    {
        members: [ ${USER_ID_1}, ${USER_ID_2} ..],
        whiteList: [ ${USER_ID_1} ... ]
        meta: { ${ANY_CHAT_ROOM_SPECIFIC_META_DATA} }
    }

```

In the **members** field, put the ids of all the people you’d like to include in the chat room as an array. (Note that the ID should be the **sub** field when you are creating your JWT token)

The way of obtaining users’ IDs depends on different applications. For a chatting application, you might have a query API on your own account server to allow your users to query people they want to send messages.

For a chatting application, you might have a query API on your own account server,
to allow your user to query their own friends / other contacts they wish to message to.

For an IoT application, instead, you might have a list of pre-written contacts in your firmware.

As a flexible messaging API, Diuit doesn’t assume the types of your application. So you can set up for your own way to interact with our server.

To create a public chat room where everyone can join with no permission, set **whiteList** field to null. To set a private chat room where only invited people can join, set the **whitelist** field to the array of user IDs, who are people invited to join the room.

The **meta** field is a general purpose field for you to store any specific information.

For example, you can store the name of your chat room in this field, a globally shared notes for your chat room, or a base64 encoded small icon. The limit is your imagination.

Again, Diuit doesn’t assume the types of your application. So it is your decision of putting the meta data you’d like to store in this field. Please note, however, that meta field can only store up to 5kb of serialized JSON string.

But please noted that the meta field can only store up to 5kb of serialized JSON
string.

## Join Chat Room

Once getting invited, your users can join an one-on-one or group conversation. Diuit provides a simple way to do it.


```java

    //@param chatId, the id of the chat room you want the user to join

    DiuitMessagingAPI.joinChat(int chatId, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onSuccess(final DiuitChat diuitChat)
        {
            // if success, it will return the DiuitChat object
        }
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });
```

```objective_c

// chatId(NSInteger) : the id of the chat you want to join

[DiuitAPI.current joinChat:chatId done:^(NSInteger statusCode, id result) {
if(statsCode == 200) {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}];
```

```swift
DiuitAPI.current?.joinChat(chatId){ code, result in
if code == 200 {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}
```

```shell
    // To join a chat-room, you emit a "chats/join" message,
    // with the following payload.
    {
        chatId: ${CHATROOM_ID}
    }
```

## Leave Chat Room

Users can also leave a conversation and they will stop receiving messages.

```java

    // Instead of calling DiuitMessageAPI, you can user the method to let your use leave a chat room
    diuitChat.leaveChat( new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
        @Override
        public void onSuccess(final DiuitChat diuitChat)
        {
            // if success, it will return the same DiuitChat object
        }
    });
```


```objective_c
//chatId : the id of the chat you want to leave
[DiuitAPI.current leaveChat:chatId done:^(NSInteger statusCode, id result) {
if (statusCode != 200) {
// if statusCode doesn't return 200, you can check result to get error message
}
}];
```

```swift
//chatId : the id of the chat you want to leave
DiuitAPI.current?.leaveChat(chatId){ code, result in
if code != 200 {
// if code doesn't return 200, you can check result to get error message
}
}
```


Leave a chat room to stop receiving messages in it.

```shell
    // To leave a chat-room, you emit a "chats/leave" message,
    // with the following payload.
    {
        chatId: ${CHATROOM_ID}
    }
```


## Updating Chat Room Meta Info

```java

    // create new meta for updating the attribute of the chat room
    JSONObject newMeta = new JSONObject();
    newMeta.put("name", newName);

    diuitChat.updateChat(newMeta, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }

        @Override
        public void onSuccess(DiuitChat diuitChat)
        {
            // if success, it will return the same DiuitChat object with new meta
        }
    });

```

```objective_c
// chat(DUChat)               : the chat you want to update
// @{YOUR_META}(NSDictionary) : meta you'd like to append

[DiuitAPI.current updateChat:chat meta:@{YOUR_META} done:^(NSInteger statusCode, id result) {
    if (statusCode == 200) {
        // if statusCode returns 200, you can get returned DUChat instance in result. Otherwise, an error message
    }
}];
```

```swift
// chat(DUChat)              : the chat you want to update
// [YOUR_META](NSDictionary) : meta you'd like to append

DiuitAPI.current?.updateChat(chat, meta:[YOUR_META]){ code, result in
    if code == 200 {
        // if code returns 200, you can get returned DUChat instance in result. Otherwise, an error message
    }
}
```

You can update the meta info of a chat room by using this command.

A chat room’s meta info can be used to hold anything application specific to the chat room. Command things to put in it is the name of the chat-room. You can also implement chat-room notes by including the notes info in this key.



```shell
    // To update the chat-room’s information,
    // emit a "chats/meta/update" message,
    // with the following payload.
    {
        chatId: ${CHATROOM_ID}
        meta: { ${CHATROOM_META} }
    }
```

Note that you have to modify the whole meta as whole; you cannot only update individual keys.

## Updating Chat Room White List

```java

    // @param serialsOfUsers : all users  you want to set into the white list of this chat room
    // @param diuitChat : the chat which you want to update
    diuitChat.updateWhiteList(ArrayList<String> memberSerials, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }

        @Override
        public void onSuccess(DiuitChat diuitChat)
        {
            // if success, it will return the same DiuitChat object
        }
    });

```

```objective_c
// chat(DUChat)    : the chat you want to update
// @[USER_SERIALS] : NSArray of NSString of user serials

[DiuitAPI.current updateWhiteList:chat users:@[USER_SERIALS] done:^(NSInteger statusCode, id result) {
    if (statusCode == 200) {
        // if statusCode returns 200, you can get returned DUChat instance in result
    }
}];
```

```swift
// chat(DUChat)             : the chat you want to update
// [USER_SERIALS]([String]) : string array of user serials

DiuitAPI.current?.updateWhiteList(chat, users: [USER_SERIALS]){ code, result in
    if code == 200 {
        // if code returns 200, you can get returned DUChat instance in result. Otherwise, an error message
    }
}
```

In a modern communication platform, the administrator of a chat room has the authority to manage and decide who can be in a chat room. This feature is presented as White List. You can use the following command to update the White List of a chat room.

This UpdateWhiteList function who is allowed to join the chat room. Setting this value to `null` allows everyone to join the chat room; setting this value to an array of user IDs will allow a specific group of users to join the chat room.

Note that if an user has already joined the chat room, excluding her from the WhiteList doesn’t kick her out from the chat room.


```shell
    // To update the **whiteList** of chat room,
    // emit a "chats/whiteList/update" message,
    // with the following payload.
    {
        chatId: ${CHATROOM_ID}
        whiteList: [ ${USER_ID_1} ]
    }
```

## Kick User from the Chat Room

```java

    diuitChat.kick(String serial, new DiuitAPICallback<DiuitChat>()
    {
        @Override
        public void onSuccess(DiuitChat diuitChat)
        {
            // if success, it will return the same DiuitChat object
        }

        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });
```

```objective_c
// chat(DUChat) :
// user(DUUser) : the user you want to kick out

[DiuitAPI.current kick:chat user:user done:^(NSInteger statusCode, id result) {
    if (statusCode != 200) {
        // if statusode doesn't return 200, you can get error message in result
    }
}];
```

```swift
// chat(DUChat) :
// user(DUUser) : the user you want to kick out

DiuitAPI.current?.kick(chat, user: user) { code, result in
    if code != 200 {
        // if code doesn't return 200, you can get error message in result
    }
}
```
This command is a function for admins to manage members in a chat room. They can remove users from the member list.

Note that kicking a user from the chat room doesn’t change the **WhiteList**. So if the user is in the White List of the chat room, she can join back to the room by himself.

To completely block a user from joining the chat room, please emit a "chat/whiteList/update" before kicking him out.


```shell
    // To kick a user from the chat room,
    // emit a "chat/kick" message,
    // with the following payload
    {
        chatId: ${CHATROOM_ID}
        userId: ${TARGET_USER_TO_KICK}
    }
```

## Receiving Message

```java
    // If you want to receive messages , you have to register receiving listener with your object
    // This object could be Activity, Fragment , or any kind of object
    // Once someone sends a message, you would get these in the callback

    DiuitAPI.registerReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

    // Before you leave the activity, or change the object to be `NULL`, you have to unregister this listener

    DiuitAPI.unregisterReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

```

```objective_c
// If you want to receive all messages , you have to add observer for notification named "messageReceived"

[[NSNotificationCenter defaultCenter] addObserverForName:@"messageReceived" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification * note) {
        DUMessage *newMessage = note.userInfo[@"message"];
        NSLog("Got new message #%zd:\n%@", newMessage.id, newMessage.data);
}];

// Or add observer for "messageReceived.${CHAT_ID}" to receive messages belong to the certain chat

[[NSNotificationCenter defaultCenter] addObserverForName:@"messageReceived.5566" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification * note) {
DUMessage *newMessage = note.userInfo[@"message"];
NSLog("Got new message #%zd in chat #5566:\n%@", newMessage.id, newMessage.data);
}];
```

```swift
// If you want to receive all messages , you have to add observer for notification named "messageReceived"

NSNotificationCenter.defaultCenter().addObserverForName("messageReceived", object: nil, queue: NSOperationQueue.mainQueue()) { notif in
        let message = notif.userInfo!["message"] as! Message
        NSLog("Got new message #\(message.id):\n\(message.data)")
}

// Or add observer for "messageReceived.${CHAT_ID}" to receive messages belong to the certain chat

NSNotificationCenter.defaultCenter().addObserverForName("messageReceived.5566", object: nil, queue: NSOperationQueue.mainQueue()) { notif in
        let message = notif.userInfo!["message"] as! Message
        NSLog("Got new message #\(message.id) in chat #5566:\n\(message.data)")
}
```

```shell
    // Listen to the `message` event

    {
        chatId: ${CHATROOM_ID},
        data: ${SOME_DATA},
        mime: ${DATA_MIME_TYPE},
        encoding: ${DATA_ENCOIDNG},
        meta: {$USER_SPECIFIC_META_FIELD}
    }
```


This is a function to add listener to this events to receive real-time messaging from the chat room.

When another user sends a message to the chat room, the listener will receive a "message" event. This message will have the following format:

<aside class='note'><br/>
{<br/>
&nbsp;&nbsp;chatId: ${CHATROOM_ID},<br/>
&nbsp;&nbsp;data: ${SOME_DATA},<br/>
&nbsp;&nbsp;mime: ${DATA_MIME_TYPE},<br/>
&nbsp;&nbsp;encoding: ${DATA_ENCOIDNG},<br/>
&nbsp;&nbsp;meta: {$USER_SPECIFIC_META_FIELD}<br/>
}
</aside>

For a text message, the **data** will be the text message itself; MIME type will be **text/plain** and the encoding will be **utf8**.

For rich media messages, the **data** will contain a url pointing to the rich media itself; the **mime** type will be the mime type of the media, and **encoding** will be an **url**.



## Send Text Message

There are mainly three message types: text, photo, and file. According to the file type, you have to call different API. Use this command to send text message in a chat room.

```java

    // @param text , your text message string
    // @param meta, it's optional
    diuitChat.sendText(String text, JSONObject meta, new DiuitAPICallback<DiuitMessage>()
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
// @"YOUR_MESSAGE"(NSString) : your text message
// chat(DUChat)              : chat to which you want to send messages

[DiuitAPI.current sendToChat:chat text:@"YOUR_MESSAGE" done:^(NSInteger statusCode, id result) {
    if (statusCode != 200) {
        // handle error
    }
}];
```

```swift
// text(String) : your text message string
// chat(DUChat) : chat to which you want to send messages

DiuitAPI.current?.sendToChat(chat!, text: text) { code, message in
    if code != 200 {
        // handle error
    }
}
```

```shell

    // To send a message to a chat room,
    // emit a "message/create" message,
    // with the following payload
    {
        chatId: ${CHATROOM_ID},
        data: ${SOME_TEXT_TO_SEND},
        mime: 'text/plain',
        encoding: 'utf8',
        meta: {$USER_SPECIFIC_META_FIELD}
    }
```


## Send Rich Media Message

RIch media message refers to photo and file. Use this command to send rich media message in a chat room


> You can use those APIs to send photos and files

```java

    // @param bitmap , the bitmap of your photo
    // @param meta, it's optional
    // @param chat, choose a chat which you want to send
    diuitChat.sendImage(Bitmap bitmap, JSONObject meta, new DiuitAPICallback<DiuitMessage>(){...})

```

```objective_c
// YOUR_IMAGE(UIImage): your image message
// chat(DUChat)       : chat to which you want to send messages

[DiuitAPI.current sendToChat:chat image:YOUR_IMAGE done:^(NSInteger statusCode, id result) {
if (statusCode != 200) {
// handle error
}
}];
```

```swift
// YOUR_IMAGE(UIImage): your image message
// chat(DUChat)       : chat to which you want to send

DiuitAPI.current?.sendToChat(chat, image: YOUR_IMAGE) { code, message in
if code != 200 {
// handle error
}
}
```
```shell

    // To send a rich media message to a chat room,
    // emit a "messages/create" message,
    // with the following payload.
    {
        chatId: ${CHATROOM_ID},
        data: ${BASE64_ENCODED_DATA},
        mime: ${MIME_TYPE_OF_DATA},
        encoding: 'base64',
        meta: {$USER_SPECIFIC_META_FIELD}
    }
```


> If you want to send a file, just call this API:

```java

    // @param file , the File object of your file
    // @param meta, it's optional
    // @param chat, choose a chat which you want to send
    diuitChat.sendFile(File file, JSONObject meta, new DiuitAPICallback<DiuitMessage>(){...})

```

```objective_c
// FILE_PATH(NSString) : path of your file message
// chat(DUChat)        : chat to which you want to send messages
// meta                : meta you'd like to append, here we pass the file name in meta

[DiuitAPI.current sendToChat: chat file: FILE_PATH meta:@{@"name":@"sampleFile.pdf"} done:^(NSInteger statusCode, id result) {
    if (statusCode != 200) {
        // handle error
    }
}];
```

```swift
// FILE_PATH(String) : path of your file message
// chat(DUChat)      : chat to which you want to send messages
// meta              : meta you'd like to append, here we pass the file name in meta

DiuitAPI.current?.sendToChat(chat!, file: FILE_PATH!, meta: ["name":"sampleFile.pdf"]) { code, message in
    if code != 200 {
        // handle error
    }
}
```

> Remember that each message has file size limitation <= 5MB

## List Historical Messages

When a new user joins a chat room, you may want her to see the historical messages. This usually happens in the cases of forum or group chat. Use this command to list historic messages.

```java

    // @param before, before the timestamp, UTC+0
    // @param page, start at 0
    diuitChat.listMessagesInChat(Date before, int count, int page, new DiuitAPICallback<ArrayList<DiuitMessage>>()
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
// chat(DUChat)    : the chat you want to query
// date(NSDate)    : you will get messages before this time
// count(NSInteger): message numbers for each page, set to 20
// page(NSInteger) : paging is supported

[DiuitAPI.current listMessagesInChat:chat  before:date count:20 page:0 done:^(NSInteger statusCode, id result) {
    if (statusCode == 200) {
        // result will return an NSArray of DUMessage
        NSArray *messages = [NSArray arrayWithArray: result];
    }
}];

```

```swift
// chat(DUChat)              : the chat you want to query
// date(NSDate, optional)    : you will get messages before this time, default is current time
// count(NSInteger): message numbers for each page, default is 20
// page(NSInteger, optional) : paging is supported, default is 0

DiuitAPI.current?.listMessagesInChat(chat) { code, result in
    if code == 200 {
        // result will return [DUMessage]
        let messages = result as! [DUMessage]
    }
}
```

```shell

    // To list messages in a chat room,
    // emit a "messages/list" message, with the following payload.
    {
        chatId: ${CHATROOM_ID},
        page: ${PAGE_NUMBER_TO_GET},
        count: ${MESSAGES_PER_PAGE},
        before: ${TIMESTAMP_IN_SEC}
    }
```

Response will contain **count** number of message before the timestamp specified in **before** field, skipping over **page * count** number of messages. (In another word, page start at 0)

Messages return in reverse chronological order, with the newest message returned first.

Therefore, in general, you call the API with the current timestamp to obtain all the latest messages, and required, call the API with an older timestamp to obtain older messages.

## Mark Message as being Read

In modern ways of communication, user would like to know if her message is read by other users. Use this command to mark a message as read. Note that it is not necessary to use this command. In some cases it may be not appropriate to have this feature. It’s perfectly fine if you want to implement a chat system without read indications.

```java

    // @param message, the message that you want to mark as read
    diuitMessage.markAsRead(new DiuitMessagingAPICallback<DiuitMessage>()
    {
        @Override
        public void onSuccess(final DiuitMessage resultObj)
        {
            // if success, it will return the same diuitMessage object
        }
        @Override
        public void onFailure(final int code, final JSONObject resultObj)
        {
            // if failure, it will return error code and result
        }
    });

```

```objective_c
// message(DUMessage) : message to be marked

[DiuitAPI.current markAsReadWithMessage:message done:^(NSInteger statusCode, id result){
    if (statusCode != 200) {
        // handle error
    }
}];
```

```swift
// message(DUMessage) : message to be marked

DiuitAPI.current?.markAsReadWithMessage(message) { code, result in
    if code != 200 {
        // handle error
    }
}
```

```shell
    // To mark a message as read,
    // emit "messages/markAsRead" message,
    // with the following payload.
    {
        messageId: ${MESSAGE_ID}
    }
```

## System Messages

Our messaging system will automatically send **system messages** to chat rooms if some interesting events happen.

There are currently 5 kinds of system messages.

### User Left Chat Room

When a user left a chat room, all members of the chat room will receive a message with type **user.left** and a single key **userId** signifying which user has left the chat room.

### User Joined Chat Room

When a user joined a chat room, all members of the chat room will receive a message with type **user.joined** and a single key **userId** signifying which user has joined the chat room.

### White List Updated

When a member of the chat room update the White List, all members in the chat room will receive a message with type **whiteList.updated**, and a single key **whiteList** providing the latest state of the white list.

### User being Kicked Out

When a user is kicked from a chat room, all members in the chat room will receive a message with type **user.kicked**, and a single key **userId** signifying which user was kicked from the chat room.

### Chat Room Meta Update

When a member in the chat room updates the chat room’s meta field, all members of the chat room will receive a message with type **meta.updated**, and a single key **meta** providing the latest state of the chat room’s meta field.



# Class

By default

## DiuitMessagingAPI

```java
    static void set(String diuitAppId, String diuitAppKey)

    //@param `diuitAppId`, the id of client app  
    //@param `diuitAppKey`, the key of client app

    static void loginWithAuthToken(DiuitMessagingAPICallback<JSONObject> callback, String authToken)

    //@param `authToken`, the auth of the device which is provided by client server  
    //@param `callback`, after logging in, Diuit server will return a JSONObject which contains the information about the device itself  


```

DiuitMessagingAPI is designed for singleton pattern. Generates a new DiuitMessageAPI, ready for authenticaion and sending messages.



## User Object

```java
    //@param Integer id, the user's id
    //@param String serial, the user's serialNumber
    //@param List<DiuitDevice> DiuitDeviceList, all devices which the user owns
```
After calling function **loginWithAuthToken**, Diuit server will return the current `DiuitUser`. It contains the user's id, serialNumber and all devices he/she owns.



## Device Object

```java
    //@param Integer id, the id of the device
    //@param String serial, the serialNumber of the device
    //@param String platform, the platform of the device
    //@param String status, the status of the device
    //@param String authToken, the auth token of the device
```
After calling function **loginWithAuthToken**, Diuit server will return the current `DiuitDevice`. It contains the information of the device, including id, serial, platform, and status.


## Chat Object

```java
    //@param Integer id, the id of the chat room
    //@param List<String> memberSerials, all memeber's serialNumber in the chat room
    //@param JSONObject meta, the meta of the chat room
    //@param DiuitMessage lastMessage, the last message in the chat room, you have to update by your self
    //@param List<String> whitList, the whitList of the chat room

    // function :
    // By calling this function, the serial would be added into memberSerials
    void addMember(String serial)
    // By calling this function, the serial would be removed from the memberSerials
    void removeMember(String serial)

```
The `Chat` class models a chat room between two or more participants within Diuit. A chat room is an on-goinh stream of messages (modeled by the `Message` class) synchronized among all participants.


## Message Object

```java
    //@param Integer id, the id of the message
    //@param String mime, the mime of the message
    //@param String encoding, the encoding of the message
    //@param JSONObject meta, the meta of the message
    //@param Date createAt, the created time of the message
    //@param DiuitChat diuitChat, the message in the chat room
    //@param DiuitUser sender, the sender of the message
    //@param List<String> reads, all readers' serialNumber

```
The `Message` class represents a message within a chat room (modeled by the `Chat` class) between two or more participants within Diuit.


## Callback

Callback attach to each Diuit API function. According different type of function, Callback will return different type of result. For example, a chat room may get inserted, or a message may get sent or marked as readed. DiuitAPI receives events on the main thread by default. The callback, running in BackgroundThread responses result on a BackgroundThread.
