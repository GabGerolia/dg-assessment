
# Developer Assessment Task - Full Stack 
#### by: John Gabriel Gerolia 
A technical assessment given to me on Sep 03, 2025 with a 14days deadline. I finished the task around Sep 13, 2025. and integrated the frontend to *Vercel* and backend to *Railway* at Sep 14, 2025.

In this Assessment I was provided an instruction which stacks to use for the development of the project **(Project Management Tool)**.

Thanks to this assessment that I learned a lot in the process. 

# Project overview
Project Link: https://dg-assessment.vercel.app

The **Project Management Tool** is a web-based application that allows users to create and manage tasks within projects. It follows the concept of a Kanban Board, where tasks are represented as cards that can be organized into customizable columns such as _To Do, In Progress,_ and _Done_. This setup provides a clear and visual way to track project progress and manage workflows effectively.

Users can create, edit, move, or delete tasks and columns based on their needs, giving them full control over how projects are structured and executed. The tool is designed to be simple, flexible, and intuitive, making it easier for individuals or teams to stay organized, prioritize work, and improve productivity.


*Listed below are the tech stacks I used.*

## Tech stacks I used

### Frontend
- React Vite
 - Javascript
 - Tailwind CSS
 - Axios
 - dndkit (For drag and drop features)

### Backend
- NodeJS
- Express
- MySQL

### Tools
 - Github Desktop
 - VS Code

### Deployment
 - Vercel
 - Railway
****
### Files inside explained
 - **Index.css** - Contains the theme of Light/Dark mode
 - **App.jsx** - Contains the route of Pages
 - Files inside **Overlay folder** are Overlay popups to notify and help user managing projects and tasks
 - File inside **Pages folder** are Main pages used in this project
 - **ConstVars.jsx** - contains preset colors for column and SVG Icons used.
 - **SortableColumn.jsx** - A wrapper to make columns Sortable
 - **TaskColumn.jsx & TaskCard.jsx** - Components for Tasks and Columns used in TaskManagement.jsx
 - **UserContext.jsx** - To identify which user is logged in even when the browser is refreshed.
 - **Server.js** is the main backend file that defines the Express server, API endpoints, and database connections for the application.



# Instructions to run the project locally.

**Steps!**

 1. Download [MySQL](https://www.mysql.com/downloads) and [VS Code.](https://code.visualstudio.com/download) 
 2. you can use Github Desktop or Git to clone it into VS Code, or download locally the GitHub repository by going (**IMPORTANT!** Make sure to select the **localhosting** branch **NOT** the main branch) [**here.**](https://github.com/GabGerolia/dg-assessment) 
 3. at MySQL create a connection. 
 Hostname: `localhost` Port: `3306` Password: `050503` Username: `root`
 (*you can put no password but you must change the value inside server.js file*)
 4. Import the provided SQL File inside the folder to MySQL Workbench.
 5. after importing, type `use myDB;` to initialize the database.
 6. Open VS Code terminal by going to View > Terminal or by pressing "ctrl + `".
 7. Make two terminals and input the following commands.
 
 *on first terminal*    `cd server`  then  `npm run dev`        *on second terminal*        `cd vite-project`  then  `npm run dev`

6. Your localhost should be running. Go to `localhost:5173/`
7. Now you should be on the Login Page of the website!
    


# Any incomplete functionality or known issues, with an explanation.

 **Security Concerns**
 

-   **Plaintext Password Storage**
    
    -   User passwords are still stored directly in the database without hashing or salting.
    -   If the database is leaked, all accounts are immediately compromised.
        
-   **No Authentication Tokens or Sessions**
    
    -   After login, the server responds with user data but does not issue a secure session or JWT token.        
    -   This means there is no persistent way to verify or protect user identity across multiple requests.
        
-   **Weak Input Validation and Sanitization**
    
    -   Input fields such as `username`, `password`, `title`, and `description` are validated for presence but not sanitized.        
    -   Although parameterized queries are used, lack of full sanitization and strict validation could expose the system to injection or malformed data issues.
        
-   **Limited Authorization Checks**
    
    -   The server verifies data ownership only partially (for example, some routes fetch `userId` for logging but do not enforce strict access control).        
    -   Users may potentially access or modify data belonging to others if endpoints are abused.
        
-   **No Password Reset or Account Recovery**
    
    -   There is no functionality for users to reset forgotten passwords or recover accounts.
        
-   **Transport Security Depends on Deployment**
    
    -   The server itself is configured to run on plain HTTP.        
    -   Railway and Vercel provide HTTPS at the domain level, but if the app is run locally without HTTPS, credentials are transmitted unencrypted.
