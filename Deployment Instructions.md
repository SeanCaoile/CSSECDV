# Deployment Instructions:

## Starting Application
To run the application, you need to have both FE and BE running at the same time. Open 2 separate terminals to run them at the same time. There are README files in both FE and BE that will explain how to run them.

Navigation to the following READMEs:
- [Backend README](BE/README.md)
- [Frontend README](FE/README.md)


## Using the Application

The app will have 3 accounts registered in the database, 1 is the admin account and the other 2 are normal accounts

# Logging in
### To login to the admin account: 
- email: admin@gmail.com
- password: Adm!n123account

### Other accounts:
- email: account1@gmail.com
- password: testAcc0unt!!!1
---
- email: account2@gmail.com
- password: testAcc0unt!!!2
---

# Registering
When registering, please provide all the necessary information. Any invalid inputs will be marked with an error message.
After registering, the account details will be saved in the db and the user will be redirected to the login page. 
___

# After Logging in
Logging in will lead you to the home page where you can see your account name and profile picture.
If the account logged in is the admin account, then the user may click on the "Admin Page" button on the top left. 
This page will allow you to see the different user accounts saved in the database except admin accounts.

Clicking home will bring the user back the home page. The user may also logout at any time by clicking the "Logout" button  

# Creating a New Admin Account
If you wish to create your own admin account, after registering an account in the database, edit the account's "isAdmin" value from 0 to 1. Alternately, changing the value from 1 to 0 removes the account's admin privileges.

# Other Information
Logs can be found in the "logs" folder under "BE" where the file is called "operations.log"