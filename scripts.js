document.getElementById('get-started').addEventListener('click', function() {
    alert('Welcome to AptoMed! Please sign up or log in to manage your medical records.');
});
import { AptosClient, AptosAccount, FaucetClient } from "aptos";

const client = new AptosClient('https://fullnode.devnet.aptoslabs.com');

async function createNewAccount() {
    const account = new AptosAccount();
    console.log("New account created with address:", account.address());
    return account;
}

async function storeMedicalRecord(account, recordHash) {
    const payload = {
        type: "entry_function_payload",
        function: "0x1::medical_records::store_record",
        arguments: [recordHash],
        type_arguments: [],
    };

    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    console.log("Transaction submitted with hash:", transactionRes.hash);
}

const userAccount = await createNewAccount();
await storeMedicalRecord(userAccount, "QmSomeIPFSHash");
