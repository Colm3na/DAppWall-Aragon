# DAppWall

# To run do:
```
npx aragon run
```
or
```
npm run start:app
```
and then 
```
npm run start:aragon:http
```
(this last option is better for debugging)


Then check the Private key for the Address #1 that aragonAPI will automatically generate for you. You need to connect to Metamask on the browser and then:
1. First connect to the local 8545 network
2. Import the account to Metamask using the private key. You can call it something like aragon-test-local.

Now you can use your first Aragon DApp in a local environment.

Note: it takes a while to load on the browser.

# In a fresh installation

Recently I upgraded to Ubuntu Bionic and had a clean install. I realized there that I had to run
- npm install --save core-js
- npm install --save regenerator-runtime 
- npm install --save @aragon/ui

first before being able to run a successfull `npx aragon run`.
Also I had to install python2.7 before all these steps, since apparently node-gyp requires this old python version. To install it, just run 
```
sudo apt update
sudo apt upgrade
sudo apt install python2.7
```
