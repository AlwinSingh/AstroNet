# AstroNet
This project is a web-based network request sender that relies on a cors-proxy to make the requests. It is a web postman.

## Deployment
This project has been deployed to: https://astronet.netlify.app

## Project Commands
You can run the REACT FRONTEND using 'npm run start'
You can run the PROXY server using 'node ./src/utility/proxy.js'
You can run the FRONTEND & PROXY server using 'npm run dev'
You can run the BUILD REACT project using 'npm run build'

## Deploying to Heroku
I recommend decoupling the Proxy server & React frontend. Deploy the Node.js proxy server to Heroku. Follow this guide (https://devcenter.heroku.com/articles/deploying-nodejs)

## Deploying to Netlify
I recommend deploying the React frontend to Netlify using this guide (https://www.netlify.com/blog/2016/07/22/deploy-react-apps-in-less-than-30-seconds/)
