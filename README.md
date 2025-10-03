

# Developer Assessment Task - Full Stack 
#### by: John Gabriel Gerolia 
A technical assessment given to me on Sep 03, 2025 with a 14days deadline. I finished the task around Sep 13, 2025. and integrated the frontend to *Vercel* and backend to *Railway* at Sep 14, 2025.

At Sep 18, 2025 I was instructed to improve the readability and structure of the code and try to minimize the incomplete functionalities of the software. I was given 10 days to finish the task. I finished the task at Sep 24, 2025.

**What are the new things added?**

 - Backend now follows the **MVC Architecture** (inside the `server` folder).
 - It now hashing passwords using *bcryptjs*.
 - Implemented *JWT-based authentication*, enabling secure login sessions and route protection.
 - Replaced callback chaining with *async/await* for cleaner and more maintainable code.
 - Centralized API for Backend and Frontend.
 - Improved readability and maintainability by following coding standards.
 - Now used docker to containerized the backend for easier deployment.

In this Assessment I was provided an instruction which stacks to use for the development of the project **(Project Management Tool)**.

Thanks to this assessment that I learned a lot in the process. 

**NOTE:** If it says `connection error` or `server error` wait a little bit since railway is sleeping. But if it doesn't work, it means I lost free credits at railway. But it will refresh every month : D 

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
**BACKEND** (server)
 - **config** Folder - has `db.js` file that handles database connection.
 - **controllers** Folder - contains files that handle application logic (processing requests, calling models, returning responses).
 - **middleware** Folder - contains functions like token verification for user authentication/authorization.
 - **models** Folder - contains files that handle database interactions and queries.
 - **routes** Folder - contains files to define API endpoints and connect them to the appropriate controllers.
 - **apiClient.js** - centralized API client used for the backend.
 - **server.js** - entry point of the backend; sets up middleware, routes, and serves the frontend in production.

**FRONTEND** (vite-project)
 -  **Overlay** Folder - contains files that handles overlay popups to notify and help user managing projects and tasks
 - **Pages** Folder - contains files that are Main pages used in this project
 - **apiClient.js** - centralized API client used for the frontend.
  - **App.jsx** - Contains the route of Pages
 - **ConstVars.jsx** - contains preset colors for column and SVG Icons used.
 - **SortableColumn.jsx** - A wrapper to make columns Sortable
 - **TaskColumn.jsx & TaskCard.jsx** - Components used for Tasks and Columns in `TaskManagement.jsx`
 - **UserContext.jsx** - To identify which user is logged in even when the browser is refreshed.
 - **Index.css** - Contains the theme of Light/Dark mode


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

**No Password Reset or Account Recovery**
    
   -  There is no functionality for users to reset forgotten passwords or recover accounts.
