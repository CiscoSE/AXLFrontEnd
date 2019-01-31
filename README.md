# AXLFrontEnd

A framework built using a MERN (Mongo, Express, React, Node) stack which controls python scripts to interact with a Cisco Unified Communications Manager database.  

## Sample use case:
In this sample implementation, the use case is to enable the search for a string or number in the CUCM database.  This is helpful not only to see where a certain string/number is found, but also to understand how the table and column names in the CUCM database correlate with fields in the GUI (as they are rarely named in the same way).  As an example, if you were trying to find the location in the CUCM database of the Display Name of a Phone Service Parameter, you can place a random string of text in that field, use this tool to search for it, and find that its stored in the telecasterserviceparameter table.

## What's a better use case:
JavaScript, while largely intended for front end implementations can now be extended to the backend using Node.js.  Given that, this entire application could have been written in JS.  However, Javascript doesn't have nearly the depth of data processing libraries as Python.  If we want to start implementing heavy data crunching, for example for lightweight ML type activities, its hard to find libraires similar to NumPy and Pandas which are feature-rich and performant.  The ability of this framework to access Python scripts and allow them to interact with CUCM, while housing the front and backend services in JS allows for the best of both worlds.

## How to install:
The project uses create-react-app.  The easiest way to install to your own working directory is to copy all files/folders in the root directory except for .lock files and the client folder.  Install the create-react-app and yarn packages and create the react app in a subfolder called 'client' (this is already assuming that npm/node are installed).  Be sure to run creat-react-app client while in the root of your working directory: 

```
npm install create-react-app yarn
create-react-app client
cd client
yarn install
cd ..
yarn install
```
At this point all the react files, and any dependancy's should have installed.

Replace the contents of the src folder installed by the create-react-app process with the files listed under src in this repository.

Python imports need to be installed manually with the following commands:
```
pip install requests
pip install pymongo
```
Having done all this you can start the development server by running the following in the root of the working directory with:
```
yarn start
```
Or deploy using
```
yarn build
```
Finally, the mongo database will need to be installed.  Instructions for download, installation, and startup can be found at the MongoDb site here: https://www.mongodb.com/

