# Push Notifications
This guideline providers you with a step-by-step guilde to configuring your application for push
Push notifications let your application notify a user of new nessages or events even when the user is not actively using your application. On Android devices, when a device receives a push notification, your application's icon and a message appear in the status bar.

## Android  
Support Diuit 0.2.5 & above

### Set up a GCM Client ID
Te send push notification messages to an Android app, you need the following:
1. Android app registered with GCM
2. Registration ID
3. Server API key(sender auth token)  

#### Step1. Creating a Google Developers Console project and client ID
1. Go to https://console.developers.google.com
2. From the **project** drop-down, select an exisiting project or create a new one by selecting Create a new project.
3. In the sidebar under "API Manager", select Credentials, then select the **Credentials** tab.
4. Select the **New credentials** drop-dwon list, and choose **API Key**
5. Create a server API key and copy your API key, which should be like **AIz...**

#### Step2. Go to Diuit Dashboard update your Android GCM certification

#### Step3. Find your project number
1. Click upper right **Google Developers Console** and select **Dashboard**
2. From the **ID** drop-down, you would see the project id  and the project number
3. copy the project number

#### Step4. Setup Diuit API in your App
1. After `DiuitMessagingAPI.loginWithAuth` success, call `DiuitMessagingAPI.setGcmProjectId()` and pass the project number as the parameter
2. New you would receive notifications while receiving new messages

#### Step5. Customize your notification
1. In your app you can override `DiuitPushBroadcastService`
2. Overwrite `showNotification(String title, String message)` and design your notifications
