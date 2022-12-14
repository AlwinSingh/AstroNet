![AstroNet](https://user-images.githubusercontent.com/62194353/200499913-4e5b619f-1b9e-4948-a4d1-bbf3c1c18564.PNG)

# AstroNet
This project is a web-based network request sender that relies on a cors-proxy to make the requests. It is a web postman.
There is a lot more work to do for this application and I will update it progressively as I go along, only if time permits.

## Features
- Viewing of response (content & raw)
- HTML rendering of response (E.g. response is a html page)
- Load testing
- Custom headers
- Custom body (Raw data, form-data, x-www-form-urlencoded)
- Supports file upload using form-data
- Authorisation support (Basic,Token,Api key)

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

## Video Demo (High Quality: https://www.veed.io/view/df6b18b4-c62d-4978-af73-f82e555eca8b?sharingWidget=true&panel=share)
https://user-images.githubusercontent.com/62194353/200502137-802799ae-28a4-4f30-96e6-95d9fc1d7208.mp4

## Video Demo of Load Testing (Multiple Requests)
https://user-images.githubusercontent.com/62194353/200501389-0e16463c-60f3-428d-98be-bbf50d2277eb.mp4
