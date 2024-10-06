
import React, { useState, useEffect } from 'react';
import { AptosClient, FaucetClient, AptosAccount, HexString } from 'aptos';

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
const faucetClient = new FaucetClient(
  "https://faucet.devnet.aptoslabs.com", 
  "https://fullnode.devnet.aptoslabs.com" 
);

const HealthCare = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [patientID, setPatientID] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);

  useEffect(() => {
    const createAccount = async () => {
      const aptosAccount = new AptosAccount();
      setAccount(aptosAccount);

      await faucetClient.fundAccount(aptosAccount.address(), 100_000_000); 
      const resources = await client.getAccountResources(aptosAccount.address());
      const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      setBalance(accountResource.data.coin.value);
    };

    createAccount();
  }, []);

  const addRecord = async () => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${account.address()}::HealthcareRecords::add_record`,
        arguments: [patientID, diagnosis, treatment],
        type_arguments: [],
      };

      const txnRequest = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);

      setTransactionHash(transactionRes.hash);
      fetchPatientRecords(); // Fetch updated records after adding
    } catch (error) {
      console.error("Error adding record", error);
    }
  };

  const fetchPatientRecords = async () => {
    try {
      const data = await client.getAccountResources(account.address());
      setPatientRecords(data); // Assuming that healthcare records are stored in account resources.
    } catch (error) {
      console.error("Error fetching patient records", error);
    }
  };

  return (
    <div className='container'>
      <h1 className="title">AptoMed<br></br></h1>
      {account && <p className='account-info'>Account Address: {account.address().toString()}</p>}
      {balance && <p className='account-info'>Account Balance: {balance / 1000000} APT</p>}

      <div className='form-section'>
        <h2>Fetch Patient Records</h2>
        <input className='input-field' type='text' placeholder='Enter Patient ID' value={patientID} onChange={(e) => setPatientID(e.target.value)} />
        <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
      </div>

      <div className="form-section">
        <h2>Add Patient Record</h2>
        <input className='input-field' type='text' placeholder='Diagnosis' value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        <input className='input-field' type='text' placeholder='Treatment' value={treatment} onChange={(e) => setTreatment(e.target.value)} />
        <button className='action-button' onClick={addRecord}>Add Record</button>
      </div>

      {transactionHash && (
        <p>Transaction Hash: {transactionHash}</p>
      )}

      <div className='records-section'>
        <h2>Patient Records</h2>
        {patientRecords.map((record, index) => (
          <div key={index} className='record-card'>
            <p>Record ID: {record.data.recordID}</p>
            <p>Diagnosis: {record.data.diagnosis}</p>
            <p>Treatment: {record.data.treatment}</p>
            <p>Timestamp: {new Date(record.data.timestamp * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthCare;
