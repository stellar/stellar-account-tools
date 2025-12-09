# Stellar Account Tools

A web application for managing Stellar accounts, built by the Stellar Development Foundation.

**Live app:** https://stellar.github.io/stellar-account-tools/

## Emergency SDP Host Access Revocation

This tool allows you to revoke your SDP (Stellar Disbursement Platform) host's access to your distribution account in case of an emergency.

**How it works:**
1. Enter your "master" public key to view all accounts it controls
2. Select the account you want to revoke access from
3. Provide your master secret key to sign the revocation transaction

After revocation, your funds remain secure and accessible through your master key. The host will permanently lose access to the account.
