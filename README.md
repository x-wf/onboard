## Requirements
- nodejs 10.14
- yarn 1.17

## Development

Install yarn
`brew install yarn`


Install dependencies:
`yarn install`

Run in development environment:
`yarn start`


## Build / Distribution

To create the signed .pkg, you need to create a `electron-builder.env`.

Follow this guide to get the needed details
https://radixdlt.atlassian.net/wiki/spaces/RR/pages/526778397/Radix+Desktop+Wallet.

You can then run
`yarn dist`

You can now find the `mac/Radix Onboard.app` under `dist`


# Code Signing

Follow this documentation in case you need to code-sign the app:
https://radixdlt.atlassian.net/wiki/spaces/RR/pages/526778397/Radix+Desktop+Wallet