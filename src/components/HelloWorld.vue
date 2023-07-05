<template>
  <div class="hello">
    <button @click="connectMetamask">Connect Metamask</button>
    <p>{{ address }}</p>
    <button @click="generateDiD">Gen DiD</button>
    <p v-if="didDoc">{{ didDoc }}</p>
    <button @click="resolveDiDDoc">Resolve the DIDDoc</button>
    <button @click="signAndRegDiDDoc">Reg DidDoc</button>
    <button @click="generateCred">Generate Bussiness VC</button>
    <button @click="issueCred">Sign and Issue VC</button>
  </div>
</template>

<script>
import { HypersignDID,HypersignVerifiableCredential } from "hs-ssi-sdk";
import loadweb3 from "../utils/web3Instance";
import Web3 from 'web3'
import {createWallet} from "../utils/createWallet"
import {HIDNODE_RPC,HIDNODE_REST,HIDNODE_NAMESPACE, BUSINESS_SCHEMA} from "../utils/hsConstants"
import { Bip39 } from '@cosmjs/crypto';
export default {
  name: "HelloWorld",
  data() {
    return {
      address: "",
      didDoc: {},
      web3: "",
      mnemonic:"clap budget team hedgehog easily valley match bubble dance wrist pioneer edit puppy skill jungle once museum nephew impulse wild consider law reflect during",
      publicKey:"",
      privateKey:"",
      signedDiDDOC:{},
      hypersignDID:{},
      hypersigndid:{},
      offlineSigner:{},
      generatedVC:{},
      signedVC:{},
      hypersignVC:{}
    };
  },
  mounted(){
    
  },
  methods: {
    async connectMetamask() {
      const web3 = await loadweb3(1);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.address = accounts[0];
    },
    async generateDiD() {
      const namespace = "testnet";
      this.hypersignDID = new HypersignDID({ namespace });
      console.log(this.hypersignDID);
      const seed = Bip39.decode(this.mnemonic,1)
      const keyPair = await this.hypersignDID.generateKeys({seed});
      this.publicKey = keyPair.publicKeyMultibase
      this.privateKey = keyPair.privateKeyMultibase
      this.offlineSigner= await createWallet(this.mnemonic)
      this.hypersigndid = new HypersignDID({
      offlineSigner:this.offlineSigner,                    // OPTIONAL signer of type OfflineSigner
      nodeRestEndpoint: 'https://api.jagrat.hypersign.id', // OPTIONAL RPC endpoint of the Hypersign blockchain, Default 'TEST'
      nodeRpcEndpoint: 'https://rpc.jagrat.hypersign.id',   // OPTIONAL REST endpoint of the Hypersign blockchain
      namespace: 'testnet',   // OPTIONAL namespace of did, Default ''
      });
      console.log(this.offlineSigner)
      const genDiD = await this.hypersignDID.createByClientSpec({
        methodSpecificId: this.address,
        publicKey: this.address,
        chainId: "0x1",
        keyType: "EcdsaSecp256k1RecoveryMethod2020",
        address: this.address,
      });
      console.log(genDiD);
      this.didDoc = genDiD;
      console.log(this.didDoc);
    },
    async resolveDiDDoc(){
      this.hypersigndid = new HypersignDID({
      offlineSigner:this.offlineSigner,                    // OPTIONAL signer of type OfflineSigner
      nodeRestEndpoint: 'https://api.jagrat.hypersign.id', // OPTIONAL RPC endpoint of the Hypersign blockchain, Default 'TEST'
      nodeRpcEndpoint: 'https://rpc.jagrat.hypersign.id',   // OPTIONAL REST endpoint of the Hypersign blockchain
      namespace: 'testnet',   // OPTIONAL namespace of did, Default ''
      });
      await this.hypersigndid.init()
        const resolvedDiDDoc = await this.hypersigndid.resolve({
        did:this.didDoc.id
        });
        console.log("re",resolvedDiDDoc)
    },
    async signAndRegDiDDoc() {
      const web3Instance = new Web3(window.web3.currentProvider)
      const accounts = await window.ethereum.request({method:"eth_requestAccounts"})
      console.log(accounts)
      window.web3 = web3Instance
      
      this.signedDiDDOC= await this.hypersigndid.signByClientSpec({
        didDocument: this.didDoc,
        clientSpec: "eth-personalSign",
        address: accounts[0],
        web3: web3Instance,
      })
      console.log(this.signedDiDDOC)
      const signInfos = [{
        verification_method_id: this.didDoc.verificationMethod[0].id,
        signature:this.signedDiDDOC.signature,
        clientSpec:{type:"eth-personalSign"}
      }]
      console.log(signInfos)  
      console.log(this.signedDiDDOC)
      const result = await this.hypersigndid.registerByClientSpec({ 
      didDocument:this.signedDiDDOC.didDocument,
      signInfos
    });
    console.log(result)
    },
    async generateCred(){
      this.hypersignVC = new HypersignVerifiableCredential({
      offlineSigner:this.offlineSigner,  
      nodeRestEndpoint:HIDNODE_REST,
      nodeRpcEndpoint:HIDNODE_RPC,
      namespace:HIDNODE_NAMESPACE
    });
    await this.hypersignVC.init();
    console.log(this.hypersignVC)
    const credentialBody = {
      schemaId: BUSINESS_SCHEMA,
      subjectDid: 'did:hid:testnet:0x53091a6690E350553aAE90D1bf554C29454c6360',
      issuerDid: 'did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC',
      fields: {
        firstName: 'Raj',
        lastName:'Patil',
        title:'Developer Advocate',
        role:'Developer Advocate',
        organization:'Hypermine'
      },
      expirationDate: '2027-12-10T18:30:00.000Z'
    }
    const credential = await this.hypersignVC.generate(credentialBody)
    console.log(credential)
    this.generatedVC = credential
    },
  async issueCred(){
    const diddoc = this.hypersigndid.generate({publicKeyMultibase:this.publicKey})
    console.log(diddoc)
    console.log(this.didDoc.verificationMethod[0].id)
      const tempIssueCredentialBody = {
  credential:this.generatedVC, // unsigned credential generated using `generated()` method
  issuerDid: "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
  verificationMethodId: "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC#key-1",
  privateKeyMultibase: this.privateKey
}

const issuedCredResult = await this.hypersignVC.issue(tempIssueCredentialBody);    
const {signedCredential, credentialStatus, credentialStatusProof, credentialStatusRegistrationResult }  = issuedCredResult;
console.log("signedCredential",signedCredential)
console.log("credentialStatus",credentialStatus)
console.log("credentialStatusProof",credentialStatusProof)
console.log("credentialStatusRegistrationResult",credentialStatusRegistrationResult)
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
