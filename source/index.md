---
title: API Reference

language_tabs:
- java: Android
- objective_c: iOS Obj-C
- swift: iOS Swift
- shell: REST / Socket.IO

toc_footers:
- <a href='#'>Sign Up for a Developer Key</a>
- <a href='http://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:
- errors

search: true
---

# Getting Started

updated : 2016/01/12 13:00

## Prerequisites for API v0.1.0

### iOS

- Support iOS 8.0+
- OS X support coming soon :)

### Android

- We do not support Java outside of Android at the moment.
- A recent version of the Android SDK  
- We support all Android versions since API Level 14 (Android 4.0 & above).

### Installation for iOS

Use Cocoapods to retrieve the framework

1. Execute command `pod init` under your Xcode project directory to create a Podfile for the project
2.  Make your Podfile look like as right：

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

3. Run `pod install` to install the framework and dependencies
4. Make sure to always open the Xcode workspace instead of the project file when building your project:

    `$ open MyApp.xcworkspace`

### Installation for Android

You can either use Maven or manually add a Jar to your project.

#### Maven

1.  Navigate to your build.gradle file at the app level (not project level) and ensure that you include the following:  

    ` maven { url "https://dl.bintray.com/zxcvbnius/maven"}`

2. Add compile **'com.duolc.diuitapi:message:0.1.1'** to the dependencies of your project
3. In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files  

#### Jar

1. Download the release package and unzip  
2. Create a new project with Android Studio  
3. Copy the **diuit-api-VERSION.jar** folder into app/libs  
4. In the Android Studio Menu: Tools -> Android -> Sync Project with Gradle Files  

## Initialization

* **iOS**

- In your **AppDelegate.m** or **AppDelegate.swift**, add following:

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


```shell  
Restful
```  

# Authentication Module

The User / Authentication module provides functionalities for managing user information.

### Authentication

Our messaging server does not directly store your users' credential. Instead,
you will need to have your own account server to manager your users' credentials
and to authenticate them for our messaging server.

After you've authenticate your user, you then encrypt a JWT token using the
**Encryption Key** obtained from us when you signed up for your account.

The JWT contains a grant telling us which user is allowed access to the messaging
server and how long the grant is effective.

Thus, authenticating a user on our messaging server is a 4 steps process.

1. Obtain a random **nonce** from our messaging server through /1/auth/nonce API.
This nonce is used to prevent replay attack on our messaging server, should the
nonce is leaked to a malicious user.

    Note that this step can be performed either by the your messaging clients or by
your account server depending on your system architecture.

2. With the nonce at hand, you authenticate your client on your account server
using whatever method you like.

    If authentication is successful, your account server should create a JWT token
granting the authenticated user access to our messaging server.

3. You should then call our /1/auth/login API using the JWT token as the parameter
to obtain a **session token**.

    Note that this step can also be done either on your messaging clients side or
on your account server, depending on your system architecture.

4. With the session token on hand, the messaging client should use it as the
value for the **X-Diuit-Session-Token** header** for all future API calls that
requires a specific user session.

    Please note that the **Encryption Key** should be kept private on your account
server, and should not be stored on your client devices, unless you have security
measures ensuring that the key can be kept secret. (For Android / iOS clients,
this is impossible, there are many ways of rooting devices, and storing your
encryption key on iOS/Android clients will make your system vulnerable to attack.)

    If you suspect that your encryption key has been compromised, please generate a
new one on [http://www.diuit.net](http://www.diuit.net) and revoke the old key.

### 1. Obtaining Authentication Nonce

The first step of authentication requires you to obtain a random nonce from our
messaging server. This nonce is used to prevent replay-attack of the JWT token.

To obtain the nonce from our server, send a GET request to the /1/auth/nonce endpoint.

```shell
curl -X GET \
-H "X-Diuit-Application-Id: ${APPLICATION_ID}" \
-H "X-Diuit-API-Key: ${REST_API_KEY}" \
https://api.diuit.net/1/auth/nonce
```

The response body is a JSON object containing the `nonce` key.

```http
{
"nonce": "123asdf123asdf12321adf",
}
```

### 2. Authenticate User On Your Account Server

The actual user authentication is performed on your own server. Perform any
authentication check you've implement to authenticate the user logging in.

### 3. Generate JWT Token

If the user's identity is verified, your server should generate a JWT token with the following header:

```http
{
"typ": "JWT",
"alg": "RS256"
"cty": "diuit-eit;v=1"
"kid": ${EncryptionKeyId}
}
```

...and with the following claim body:

```http
{
"iss": ${APPLICATION_ID}
"sub": ${UNIQUE_USER_ID}
"iat": ${CURRENT_TIME_IN_ISO8601_FORMAT}
"exp": ${SESSION_EXPIRATION_TIME_IN_ISO8601_FORMAT}
"nce": ${AUTHENTICATION_NONCE}
}
```

... then encrypt the whole thing with your **Encryption Key** obtained when
registering for your account.

Note that you can put anything in the "sub" field, as long as you can co-relate
this to the user on your system. Our messaging server will use this field to
identify this user.

In "exp" field, you specify when this grant should expire, this field controls
how long the session token generated in the next step will be valid for.

Setting this to a relative short value makes the system more secure; leaking
a session token will have limited damage. But with the draw-back that you will
have to re-autheticate the user every so often.

Setting this to a long value can also be useful for IOT application, where you
are pretty confident that the device cannot be hacked, and you can pre-generate
your session token, and set a extremely long expiration date to effectively make
the device always authenticated. But you will have to ensure that the session
token is never leaked in this case. (The session token will essentially behaves
like a randomly generated password in this case).

For the "kid" field, put the **Encryption Key Id**, not **Encryption Key** itself.
The JWT header itself is not encrypted, so never put any private data in the
JWT header

### 4. Obtaining Session Token with Authentication Token

With the JWT token generated, you then POST to the /1/auth/login API with the
**auth-token** parameter set to the JWT token to obtain a session token for
the user.

This step can be done either on the server side or client side depending on your
own system architecture. But please note that when logging in, you will also
need to provide the **deviceId** field to uniquely identify the current device
that the user is logging in from.

If you are using a web platform, please generate a unique UUID to link with the
current web session. (And possibly store the UUID in local storage / cookie).

If your wish to enable push notification on mobile devices, please pass two
additional fields: **platform** to indicate what is the push platform to be
used (valid values are one of "gcm", "ios_sandbox", "ios_production"), and a
**pushToken** field to indicate the pushToken specific to the push platform.

```http
curl -X POST \
-H "X-Diuit-Application-Id: ${APPLICATION_ID}" \
-H "X-Diuit-API-Key: ${REST_API_KEY}" \
-H "Content-Type: application/json" \
-d '{"authToken":"JWT_TOKEN", "deviceId": "DEVICE_ID", "platform": "PUSH_PLATFORM", "pushToken": "PUSH_TOKEN"}' \
https://api.diuit.net/1/auth/login
```

If successful, the response will be a JSON object contains the `sessionToken`
key that should be set in future API calls as `X-Diuit-Session-Token` header to
authenticate the user.

### Authenticate With Socket.IO

After authenticating the user, and obtaining the session-token, you can start
the real-time messaging session by opening a Socket.IO connection to our
`http://www.diuit.net` server.

After the socket.io session is connected, you have 15 seconds to emit a
`authenticate` message with payload `{authToken: ${SESSION_TOKEN}}` to authenticate
the user.

The server should respond with a JSON payload containing your device info to
signify login success. After which you can use the other Socket.IO APIs.

If you've failed to send an authenticate message within 15 seconds, the connection
will be terminated by our server automatically.

Upon re-connection, you should repeat the authentication message to ensure you
are properly authenticated and call other APIs.

# Integration

Diuit is a powerful tool that lets you add in-app messaging with very little
overhead. Diuit can work with any existing User Management system, and includes f
eatures such as querying, Message delivery and read receipts, Conversation
metadata, and typing indicators.

## Listing Chat Rooms

To list all chat-rooms you are currently joined in, emit a "chats/list" message,
with empty payload.

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

```http  

```

## Create a Chat Room

To create a chat-room, emit a "chats/creat" message, with the following payload:

<aside class="note">
{
members: [ ${USER_ID_1}, ${USER_ID_2} ..]
whiteList: [ ${USER_ID_1} ... ]
meta: { ${ANY_CHAT_ROOM_SPECIFIC_META_DATA} }
}
</aside>
<br></br>

For **members** field, put the ids of all the people you wish to include the
chatroom as an array. (Note that the ID should be the **sub** field when you
are creating your JWT token)

How you obtain other users' IDs is application specific, and is not the
responsibility of our messaging API.

For a chatting application, you might have a query API on your own account server,
to allow your user to query their own friends / other contacts they wish to message to.

For a IOT application, you might have a list of pre-written contacts in your
firmware instead.

Our messaging API makes no assumption about what kind of application you are
developing.

<hr/>

To create a public chatroom where everyone can freely join, set **whiteList**
field to null. To set a restricted chatroom where only certain people can join,
set the **whitelist** field to the array of user Ids that can join the room.

<hr/>

The **meta** field is a general purpose field for you to store any chat-room
specific information.

For example, you can store the name of your chat-room, a globally shared notes
for your chat-room, a base64 encoded small icon for your chatroom, etc.

Again, our messaging makes no assumption about what kind of application you are
developing, so it's up to you on what you need to store along with the chat-room's
meta data.

But please noted that the meta field can only store up to 5kb of serialized JSON
string.

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
// @[USER_SERIALS] : put all users' serial you want to join in this NSArray of NSString

// @{YOUR_META} (Optional) : any meta data you want to append on this chatroom, as long as it's an NSDictionary

[DiuitAPI.current createChat:@[USER_SERIALS] meta:@{YOUR_META} done:^(NSInteger statusCode, id result) {
if (statusCode == 200) {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}];
```
```swift
// [USER_SERIALS] : put all users' serial you want to join in this NSArray of NSString

// [YOUR_META] (Optional) : any meta data you want to append on this chatroom, as long as it's an NSDictionary

DiuitAPI.current?.createChat([USER_SERIALS], meta: [YOUR_META]) { code, result in
if code == 200 {
// if statusCode returns 200, you will get returned result, a DUChat instance. Otherwise, an error message.
}
}
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

//@param chatId , the id of the chat you want to leave
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
```http

```


## Updating Chat Room Meta Info

To update the chat-room's information, emit a "chats/meta/update" message, with
the following payload:

<aside class="note">
{
chatId: ${CHATROOM_ID}
meta: { ${CHATROOM_META} }
}

Note that you have to modify the whole meta as whole; you cannot just update
individual keys.

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

```http

```



## Updating Chat Room White List

To update the chat-room's **whiteList**, emit a "chats/whiteList/update"
message, with the following payload:

<aside class="note">
{
chatId: ${CHATROOM_ID}
whiteList: [ ${USER_ID_1} ]
}
</aside>
<br></br>

Note, to clear whiteList to `null`, pass a `null for thewhiteList` field.

Also note that removing a person from the white list doesn't kick a person
from the chat-room if he's already joined to the chat room.

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

```http

```


## Kick a User from Chat Room

To kick a user from the chat room, emit a "chat/kick" message, with the
following payload

<aside class="note">
{
chatId: ${CHATROOM_ID}
userId: ${TARGET_USER_TO_KICK}
}
</aside>
<br></br>

Note that kicking a user from the chat room doesn't change the chatRoom's
**whiteList**. So if the user is in the white list of the chat room, he can
join back to the room himself.

To completely ban a user from the chat room, emit a "chat/whiteList/update"
first, before kicking him out.

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

```http

```


## Receiving a Message

When a user send a message to the chatroom you are joined in. You will receive
a "message" event. You should listen for the event to receive real-time messages.
The message will have the following format:

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

For text message, the mime type will be **text/plain** and the encoding will be
**utf8**, and the **data** will be the text message itself.

For rich media messages, the **mime** type will be the mime type of the media
and **encoding** will be **url**, and  **data** will contain a url pointing to
the rich media itself.

```java
// If you want to receive messages , you have to register receiving listener with your object  
// This object could be Activity, Fragment , or any kind of object   
// Once someone send you a message , you would get these in the callback

DiuitAPI.current.registerReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

// Before you leave the activity, or change the object to be `NULL`, you have to unregister this listener  

DiuitAPI.current.unregisterReceivingMessage(DiuitAPICallback<DiuitMessage> callback)

```


```objective_c
// If you want to receive messages , you have to register receiving listener with your object
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

```http

```



## Send a Text Message

To send a message to a chat room, emit a "message/create" message, with the
following payload

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
> According different type, you have to call different API.
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
// @"YOUR_MESSAGE": your text message NSString
// chat(DUChat)   : chat to which you want to send messages

[DiuitAPI.current sendToChat:chat text:@"YOUR_MESSAGE" done:^(NSInteger statusCode, id result) {
if (statusCode != 200) {
// handle error
}
}];
```
```swift
// text(String) : your text message string
// chat(DUChat) : chat to which you want to send messages

DiuitAPI.current?.sendToChat(chat!, text: self.textfield.text!) { code, message in
if code != 200 {
// handle error
}
}
```


```http

```


## Send a Rich Media Message

To send a rich media message to a chat room, emit a "messages/create" message,
with the following payload

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

```http

```

> If you want to send your file , just call this API:

```java

// @param file , the File object of your file
// @param chat, choose a chat which you want to send
DiuitAPI.current.sendToChat(DiuitChat chat, File file, new DiuitAPICallback<DiuitMessage>(){...})

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

DiuitAPI.current?.sendToChat(chat!, file: path!, meta: ["name":"sampleFile.pdf"]) { code, message in
if code != 200 {
// handle error
}
}
```

```http

```

> Remember , each message has file size limit <= 5MB


## List Messages In a Chat Room

To list messages in a chat room, emit a "messages/list" message, with the
following payload

<aside class="note">
{
chatId: ${CHATROOM_ID},
page: ${PAGE_NUMBER_TO_GET},
count: ${MESSAGES_PER_PAGE},
before: ${TIMESTAMP_IN_SEC},
}
</aside>
<br></br>

Response will contain **count** number of message before the timestamp specified
in **before** field, skipping over **page** * **count** number of messages.
(In another word, page start at 0)

Messages are returned in reverse chronological order, with the newest message
returned first.

So, in general, you call the API with the current timestamp to obtain all the
latest messages, and required, call the API with an older timestamp to obtain
older messages.


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
// chat(DUChat)    : the chat you want to query
// date(NSDate)    : you will get messages before this time
// count(NSInteger): message numbers for each page, set to 20
// page(NSInteger) : paging is supported

[DiuitAPI.current listMessagesInChat:chat  before:date count:20 page:0 done:^(NSInteger statusCode, id result) {
if (statusCode == 200) {
// result will return an NSArray of DUMessage
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
}
```

```http

```


## Mark a Message as being Read

To mark a message as being read, emit "messages/markAsRead" message, with the
following payload.

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

```http

```

## System Messages

Our messaging system will automatically send **system messages** to chatrooms
when interesting events happen in them.

There are currently 5 system messages.

### User Left Chatroom

When a user left a chatroom, all members of the chatroom will receive a message
with type **user.left** and a single key **userId** signifying which user has
left the chatroom.

### User Joined Chatroom

When a user joined a chatroom, all members of the chatroom will receive a message
with type **user.joined** and a single key **userId** signifying which user has
joined the chatroom.

### White List Updated

When a member of the chatroom update the white list, all members of the chatroom
will receive a message with type **whiteList.updated**, and a single key
**whiteList** providing the latest state of the white list.

### User Kicked

When a user is kicked from a chatroom, all members of the chatroom will receive
a message with type **user.kicked**, and a single key **userId** signifying which
user has been kicked from the chatroom.

### Chatroom Meta Updated

When a member of the chatroom updates the chatroom meta field, all members of
the chatroom will receive a message with type **meta.updated**, and a single
key **meta** providing the latest state of the chatroom meta field.

# Models

Diuit message api models are defined by implementing something very similar to [socket.io](http://socket.io)
Simply extend our DiuitObject class and let the Diuit annotations processor generate proxy classes.
In out api, there are 4 models you might to know:

### **DiuitUser**
### **DiuitDevice**
### **DiuitChat**
### **DiuitMessage**
