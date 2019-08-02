# DAppWall

DAppWall was just published to Rinkeby testnet!! 🎉🎉🎉
(and it is already in v2.0.0)

Here all the infos:

- Name & Version: `dappwallexp.open.aragonpm.eth v2.0.0` 
- Contract address: `0x2eDBb3E96d03F406dd1c1f4ce14BE1d4e03D877E` 
- Content (ipfs): `QmY2Su3PxaVbDYBq8MyKvr5kWPKuwPpZ7iUnv11v9wFVso` 

- Transaction hash: 0x3b4c75a656d8722297f83e779f7b516d5637ba3ca12cb41c04cf9b8c41a52375

# To install in your DAO do:

1. `dao install <name-of-your-dao>.aragonid.eth dappwallexp.open.aragonpm.eth 2.0.0 --env rinkeby`

2. Then vote for it to be added into the DAO apps set.

3. Once the vote is enacted as 'Yes', run:

First, check your `dappwallexp` proxy address by doing:
`dao apps dappwalltest0.aragonid.eth --all  --env rinkeby`
It should appear as the last one of the apps list, as `permissionless app`.

Finally, execute:
`dao acl create <your-daos-name>.aragonid.eth <dappwallexp-proxy-address>  INPUT_IP_ROLE <your-daos-voting-app-address> <your-daos-voting-app-address> --env rinkeby`

4. You need to vote once more to grant permissions to this app.

5. DAppWall experimental version is now available in your DAO! 😉


# To run this repo in your local machine do:
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
