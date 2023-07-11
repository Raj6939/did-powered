<template>
  <div class="hello">
    <h1>DID Powered</h1>
    <loading
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>
    <a
      class="pt-4"
      v-if="didDoc"
      :href="`https://explorer.hypersign.id/hypersign-testnet/identity/${didDoc.id}`"
      target="_blank"
      >{{ didDoc ? didDoc.id : "" }}</a
    >
    <div class="container">
      <b-card class="custom-card">
        <b-tabs>
          <b-tab title="DID"
          :active="activeTab === 'tab1'">
            <b-button class="mt-4" @click="connectMetamask">{{
              address ? address : "Connect Metamask"
            }}</b-button>
            <br />
            <b-button class="mt-4" v-if="address" @click="generateDiD"
              >Generate DiD Document</b-button
            >
            <div :class="didDoc ? 'didDocContainer' : ''" v-if="didDoc">
              <!-- <p v-if="didDoc">{{ preetyfyDoc(didDoc) }}</p> -->
              <div class="d-flex">
                <p>Generated DID Document</p>
                <a class="ml-auto" style="cursor: pointer" @click="copy"
                  >Copy</a
                >
              </div>
              <!-- <json-viewer v-if="didDoc" :value="didDoc" :expanded="true" :depth="2" :copyable="true"></json-viewer>         -->
              <vue-json-editor
                v-model="didDoc"
                :show-btns="false"
                :expandedOnStart="true"
                @json-change="onJsonChange"
              ></vue-json-editor>
            </div>
            <b-button v-if="didDoc" class="mr-2 mt-2" @click="resolveDiDDoc"
              >Resolve the DIDDoc</b-button
            >
            <b-button v-if="didDoc" class="mr-2 mt-2" @click="signAndRegDiDDoc"
              >Reg DidDoc</b-button
            >
            <b-button v-if="showUpdateButton" class="mt-2" @click="updateDidDoc"
              >Update DidDoc</b-button
            >
          </b-tab>
          <b-tab title="Schema"
          :active="activeTab === 'tab2'">
            <p v-if="showSchemaRegStatus" class="mt-4" >Issue Verifiable Credential for recently registered Schema<a class="ml-2" @click="goToTab('tab3')">{{signedSchema.id}}</a></p>
            <div class="row">              
              <div class="w-50 pr-4">
                <div class="form-group row pt-4">
                  <label class="col-sm-2 col-form-label" for="schemaName"
                    ><strong
                      >Name<span style="color: red">*</span>:</strong
                    ></label
                  >
                  <div class="col-sm-10">
                    <input
                      type="text"
                      class="form-control"
                      id="schemaName"
                      aria-describedby="schemaNameHelp"
                      placeholder="Enter Schema name"
                      v-model="schemaBody.name"
                    />
                  </div>
                </div>
                <div class="form-group row pt-4">
                  <label class="col-sm-2 col-form-label" for="schemaName"
                    ><strong>Description:</strong></label
                  >
                  <div class="col-sm-10">
                    <input
                      type="text"
                      class="form-control"
                      id="schemaDescription"
                      aria-describedby="schemaDescription"
                      placeholder="Enter short description of schema"
                      v-model="schemaBody.description"
                    />
                  </div>
                </div>
                <div
                  class="selected-media-wrapper d-flex p-2 mb-4"
                  style="overflow-y: auto"
                  v-if="attributes.length > 0"
                >
                  <div v-for="(attr, index) in attributes" :key="index">
                    <div
                      :class="
                        flash == index
                          ? 'flash card rounded m-1 p-1 d-flex flex-row align-items-center'
                          : 'card rounded m-1 p-1 d-flex flex-row align-items-center'
                      "
                      style="cursor: pointer"
                      @click="handleClick(attr)"
                      :title="attr.name"
                    >
                      {{ attr.name }}
                      <i
                        title="click to delete"
                        class="fas fa-minus-circle"
                        style="color: #d9534f"
                      ></i>
                      <span style="color: gray; padding-left: 5px"> </span>
                    </div>
                  </div>
                </div>
                <div class="form-group row pt-4">
                  <label class="col-sm-2 col-form-label" for="schemaName"
                    ><strong
                      >Add Fields<span style="color: red">*</span>:</strong
                    ></label
                  >

                  <div class="col-sm-10 d-flex">
                    <input
                      type="text"
                      class="form-control"
                      id="schemaAttributes"
                      aria-describedby="schemaAttributes"
                      placeholder="variable name"
                      v-model="selectedAtt.name"
                    />
                    <b-form-select
                      v-model="selectedAtt.type"
                      placeholder="Select Type"
                      :options="dataTypeOptions"
                    ></b-form-select>
                  </div>
                  <b-button style="margin-left: 5%" @click="addAttributes"
                    >Add</b-button
                  >
                </div>
                <b-button @click="regSchemaPopup"
                  >Save and Sign Schema</b-button
                >
              </div>

              <div class="w-50 ml-auto mt-4">
                <vue-json-editor
                  v-model="schemaBody"
                  :show-btns="false"
                  :expandedOnStart="true"
                  @json-change="onJsonChange"
                ></vue-json-editor>
              </div>
            </div>
          </b-tab>
          <b-tab title="Verifiable Credential"
          :active="activeTab === 'tab3'">                   
          <b-tabs class="mt-4">
            <b-tab title="Issue Credential">    
            <p v-if="vcId" class="mt-4 blink" >Resolve Verifiable Credential Status and Perform Credential Revocation<a class="ml-2" style="cursor:pointer" @click="goToTab('tab4')">go to resolve</a></p>                     
            <div class="form-group row pt-4">
              <label class="col-sm-2 col-form-label" for="schemaName"
                ><strong>Schema ID<span style="color: red">*</span>:</strong></label
              >
              <div class="col-sm-10">
                <input
                  type="text"
                  class="form-control"
                  id="schemaName"
                  aria-describedby="schemaNameHelp"
                  placeholder="Enter Schema ID"
                  v-model="schemaId"
                />
              </div>
            </div>
            <b-button @click="resolveSchema">Resolve Schema</b-button>
            <br />
            <p class="mt-4" v-if="issueCredAttributes.length">Enter values for Credential Attributes</p>
            <div v-for="(fields, index) in issueCredAttributes" :key="index">
              <input
                type="text"
                class="form-control mt-2"
                id="schemaName"
                aria-describedby="schemaNameHelp"
                :placeholder="fields.name"
                v-model="fields.value"
              />
            </div>
            <hr />
            <div
              :class="generatedVC ? 'didDocContainer' : ''"
              v-if="generatedVC"
            >
              <vue-json-editor
                v-model="generatedVC"
                :show-btns="false"
                :expandedOnStart="true"
                @json-change="onJsonChange"
              ></vue-json-editor>
            </div>
            <div class="mr-4 mt-4">
            <b-button @click="issueCred"
              v-if="issueCredAttributes.length"
              >Sign and Issue VC</b-button
            >     
            <b-button class="ml-2" v-if="issuedCred!==null" @click="syncEdv">Store Credential in EDV</b-button>            
            </div>                   
            </b-tab>            
            <b-tab title="Resolve Credential"
            :active="activeTab === 'tab4'">
              <div class="form-group row pt-4">
              <label class="col-sm-2 col-form-label" for="schemaName"
                ><strong>VC ID<span style="color: red">*</span>:</strong></label
              >
              <div class="col-sm-10">
                <input
                  type="text"
                  class="form-control"
                  id="schemaName"
                  aria-describedby="schemaNameHelp"
                  placeholder="Enter VC ID"
                  v-model="vcId"
                />
              </div>
            </div>
            <b-button @click="resolveVcStatus">Resolve VC Status</b-button>
            <vue-json-editor
                v-if="credStatus"
                class="mt-2"
                v-model="credStatus"
                :show-btns="false"
                :expandedOnStart="true"
                @json-change="onJsonChange"
              ></vue-json-editor>
              <div class="pt-2" v-if="credStatus">
              <b-button @click="updateCredentialStatus('SUSPENDED')">Suspend VC</b-button>
              <b-button class="ml-2 mr-2" @click="updateCredentialStatus('Live')">Live VC</b-button>
              <b-button @click="updateCredentialStatus('REVOKED')">Revoke VC</b-button>
              </div>
            </b-tab>
            <b-tab title="Fetch Credential"
            :active="activeTab === 'tab5'">
              <div class="text-right mt-4">                
                <b-button @click="fetchAllVcFn">Fetch All VC from EDV</b-button>                
            </div> 
            <div class="row mt-4 ml-4">
            <div v-for="(cred, index) in fetchEncryptedCred" :key="index">
            <b-card
              title="Encrypted Cred"              
              tag="article"
              style="max-width: 20rem;"
              class="mb-2 mr-3"
            >
              <b-card-text>
                {{cred.id}}
              </b-card-text>

              <b-button variant="primary" @click="decryptVc(cred)">Decrypt VC</b-button>
            </b-card>
            </div>
            </div>
            </b-tab>
          </b-tabs>          
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
    <hf-pop-up Header="Resolved DID Document" Id="view-didDoc" Size="xl">
      <json-viewer
        :value="resolvedDiDDocument"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>
    </hf-pop-up>
    <hf-pop-up Header="Schema Register" Id="reg-schema" Size="xl">
      <div class="text-center">
      <p v-if="showSchemaRegStatus">View Schema<a class="ml-2" :href="`https://explorer.hypersign.id/hypersign-testnet/schemas/${signedSchema.id}`" target="_blank">{{signedSchema.id}}</a></p>
      </div>
      <json-viewer
        :value="signedSchema"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>
      <div class="text-center">
        <b-button @click="regSchema">Register Schema</b-button>
      </div>
    </hf-pop-up>
    <hf-pop-up Header="Update DID Document" Id="update-didDoc" Size="xl">
      <p>{{ didDoc }}</p>
    </hf-pop-up>
    <hf-pop-up Header="Issued Verifiable Credential" Id="issued-vc" Size="xl">
      <div class="text-center">
        <p>Click to View VC Status on blockchain</p>
        <a      
      v-if="issuedCred"
      :href="`https://explorer.hypersign.id/hypersign-testnet/revocationRegistry/${issuedCred.id}`"
      target="_blank"
      >{{ issuedCred ? issuedCred.id : "" }}</a
    >
      </div>
      <json-viewer
        :value="issuedCred"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>          
    </hf-pop-up>
    <!--  -->
    <hf-pop-up Header="Decrypted Verifiable Credential" Id="decrypted-vc" Size="xl">      
      <json-viewer
        :value="showDecryptedCred"
        :expanded="true"
        :depth="2"
        :copyable="true"
      ></json-viewer>          
    </hf-pop-up>
  </div>
</template>

<script>
import { BTab, BTabs } from "bootstrap-vue";
import {
  HypersignDID,
  HypersignSchema,
  HypersignVerifiableCredential,
} from "hs-ssi-sdk";
import loadweb3 from "../utils/web3Instance";
import Web3 from "web3";
import { createWallet } from "../utils/createWallet";
import Loading from "vue-loading-overlay";
// import 'vue-loading-overlay/dist/css/index.css';
import {
  HIDNODE_RPC,
  HIDNODE_REST,
  HIDNODE_NAMESPACE,
  // BUSINESS_SCHEMA,
} from "../utils/hsConstants";
import { Bip39 } from "@cosmjs/crypto";
import hfPopUp from "@/elements/hfPopUp.vue";
import vueJsonEditor from "vue-json-editor";
import { Buffer } from "buffer";
import isEqual from "lodash/isEqual";
window.Buffer = Buffer;
import toast from "../utils/toast";
import {HypersignEdvClientEcdsaSecp256k1} from "@hypersign-protocol/hypersign-vault-client";
import multibase from "multibase";
export default {
  name: "HelloWorld",
  components: { BTab, BTabs, hfPopUp, vueJsonEditor, Loading },
  data() {
    return {
      showDecryptedCred:null,
      publicKeyMultibase:'',
      edvClient:{},
      userPublicKeyMultibase:'',
      vcId:'',
      activeTab: 'tab1',
      showSchemaRegStatus:false,
      allFields: [],
      schemaId: "",
      hypersignSchema: {},
      schemaToReg: {},
      signedSchema: {},
      flash: null,
      fullPage: true,
      isLoading: false,
      attributes: [],
      selected: null,
      selectedAtt: {
        name: "",
        type: null,
        required: false,
      },
      dataTypeOptions: [
        { text: "Select Type", value: null },
        { text: "string", value: "string" },
        { text: "integer", value: "integer" },
        { text: "number", value: "number" },
        { text: "boolean", value: "boolean" },
        { text: "date-time", value: "date" },
      ],
      schemaBody: {
        name: "",
        description: "",
        author: "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
        fields: [],
        additionalProperties: false,
      },
      showUpdateButton: false,
      address: "",
      didDoc: null,
      web3: "",
      mnemonic:
        "clap budget team hedgehog easily valley match bubble dance wrist pioneer edit puppy skill jungle once museum nephew impulse wild consider law reflect during",
      publicKey: "",
      privateKey: "",
      signedDiDDOC: {},
      hypersignDID: {},
      hypersigndid: {},
      offlineSigner: {},
      generatedVC: null,
      signedVC: {},
      hypersignVC: {},
      issuedCred: null,
      resolvedDiDDocument: {},
      issueCredAttributes: [],
      credStatus:null,
      keyAgreementKeyPair:{},
      fetchEncryptedCred:[]
    };
  },
  async mounted() {
    const namespace = "testnet";
    this.hypersignDID = new HypersignDID({ namespace });    
    const seed = Bip39.decode(this.mnemonic, 1);
    const keyPair = await this.hypersignDID.generateKeys({ seed });
    this.publicKey = keyPair.publicKeyMultibase;
    this.privateKey = keyPair.privateKeyMultibase;
    this.offlineSigner = await createWallet(this.mnemonic);
    this.hypersigndid = new HypersignDID({
      offlineSigner: this.offlineSigner, // OPTIONAL signer of type OfflineSigner
      nodeRestEndpoint: HIDNODE_REST, // OPTIONAL RPC endpoint of the Hypersign blockchain, Default 'TEST'
      nodeRpcEndpoint: HIDNODE_RPC, // OPTIONAL REST endpoint of the Hypersign blockchain
      namespace:HIDNODE_NAMESPACE, // OPTIONAL namespace of did, Default ''
    });
    await this.hypersigndid.init();    
    this.hypersignSchema = new HypersignSchema({
      offlineSigner: this.offlineSigner, // OPTIONAL signer of type OfflineSigner
      nodeRestEndpoint: HIDNODE_REST, // OPTIONAL RPC endpoint of the Hypersign blockchain, Default 'TEST'
      nodeRpcEndpoint: HIDNODE_RPC, // OPTIONAL REST endpoint of the Hypersign blockchain
      namespace:HIDNODE_NAMESPACE, // OPTIONAL namespace of did, Default ''
    });    
    await this.hypersignSchema.init();
    this.hypersignVC = new HypersignVerifiableCredential({
        offlineSigner: this.offlineSigner,
        nodeRestEndpoint: HIDNODE_REST,
        nodeRpcEndpoint: HIDNODE_RPC,
        namespace:HIDNODE_NAMESPACE,
      });
    await this.hypersignVC.init();    
  },
  methods: {
    async fetchAllVcFn(){
      try {
        if(!this.didDoc){
          throw new Error('Connect Metamask in DID tab')
        }
        const allVc = await this.edvClient.fetchAllDocs({
        edvId: `hs:edv:${this.didDoc.id}`
      })      
      this.fetchEncryptedCred = allVc      
      } catch (error) {
        this.toast(error,'error')
      }     
    },
    async resolveVcStatus(){
      try {
        if(this.vcId===""){
          throw new Error('Enter VC Id')
        }
      const verificationResult = await this.hypersignVC.resolveCredentialStatus({credentialId:this.vcId});      
      this.credStatus = verificationResult  
      } catch (error) {
        this.toast(error,'error')
      }      
    },
    async updateCredentialStatus(statusToUpdate){
      try {
        const params = {
            credentialStatus:this.credStatus,
            issuerDid: "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
            verificationMethodId:"did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC#key-1",
            privateKeyMultibase:this.privateKey,
            status: statusToUpdate, 
            statusReason: 'Suspending this credential for some time',
      };
      const updatedCredResult = await this.hypersignVC.updateCredentialStatus(params);      
      if(updatedCredResult.code === 0){
        this.toast('Credential Status Updated Successfully','success')
      }
      } catch (error) {
        this.toast(error,'error')
      }
      
    },
    goToTab(tab){
      this.activeTab = tab
      this.schemaId = this.signedSchema.id
    },
    async resolveSchema() {
      if (this.schemaId === "") {
        return this.toast("Enter Schema ID", "error");
      }
      this.issueCredAttributes = [];
      const result = await this.hypersignSchema.resolve({
        schemaId: this.schemaId,
      });      
      this.allFields = JSON.parse(result.schema.properties);
      const requiredFields = result.schema.required;      
      for (const e of Object.entries(this.allFields)) {
        let dataToPush = {
          type: e[1].type,
          name: e[0],
        };
        switch (e[1].type) {
          case "boolean":
            dataToPush["value"] = null;
            break;
          case "string":
            dataToPush["value"] = "";
            break;
          case "number":
            dataToPush["value"] = "";
            break;
          case "integer":
            dataToPush["value"] = "";
            break;
          case "date":
            dataToPush["value"] = "";
            break;
          default:
            this.toast("invalid type", "error");
        }        
        this.issueCredAttributes.push(dataToPush);        
      }
      this.issueCredAttributes.map((x) => {
        if (requiredFields.includes(x.name)) {
          x["required"] = true;
        } else {
          x["required"] = false;
        }
      }); 
    },
    async regSchema() {      
      const registeredSchema = await this.hypersignSchema.register({
        schema: this.signedSchema,
      });      
      const {code} = registeredSchema      
      if(code === 0){
        this.showSchemaRegStatus = true
        this.toast('Schema Registerd Successfully','success')
      }
    },
    async regSchemaPopup() {
      this.showSchemaRegStatus = false
      if (this.schemaBody.name !== "" && this.schemaBody.fields.length > 0) {
        this.$root.$emit("bv::show::modal", "reg-schema");        
        const schemaToReg = await this.hypersignSchema.generate(
          this.schemaBody
        );        
        this.signedSchema = await this.hypersignSchema.sign({
          privateKeyMultibase: this.privateKey,
          schema: schemaToReg,
          verificationMethodId:
            "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC#key-1",
        });        
      } else {
        this.toast("Enter necessary details to reg Schema", "error");
      }
    },
    handleClick(attr) {
      this.flash = attr;
      const actionIndex = this.attributes.findIndex((x) => x === attr);
      if (actionIndex > -1) {
        this.attributes.splice(actionIndex, 1);
        this.schemaBody.fields.splice(actionIndex, 1);
      }     
    },
    copy() {
      if (this.didDoc) {
        navigator.clipboard
          .writeText(JSON.stringify(this.didDoc))
          .then(() => {
            this.toast("DID Document Copied to Clipboard", "success");
          })
          .catch((err) => {
            window.alert("Error while copying", err);
          });
      }
    },
    onJsonChange(newCode) {      
      let hasChanged = !isEqual(newCode, this.didDoc);
    console.log(hasChanged);

      // if( !== oldDiD)
      // {
      //   console.log('not same')
      // }
      // if(newDID===oldDiD){
      //   console.log('yes')
      //   console.log(this.didDoc)
      //   console.log(newCode)
      //   this.showUpdateButton = false
      // }else{
      //   console.log('else')
      //   this.showUpdateButton = true
      // }
    },
    async connectMetamask() {
      const web3 = await loadweb3(1);
      const accounts = await web3.eth.getAccounts();      
      const publicKey = await ethereum.request({ method: 'eth_getEncryptionPublicKey', params: [accounts[0]] });
      this.userPublicKeyMultibase=publicKey      
      this.address = accounts[0];
      await this.generateDiD()
    },
    async generateDiD() {      
      const genDiD = await this.hypersignDID.createByClientSpec({
        methodSpecificId: this.address,
        publicKey: this.address,
        chainId: "0x1",
        keyType: "EcdsaSecp256k1RecoveryMethod2020",
        address: this.address,
      });      
      this.didDoc = genDiD;         
      const verificationMethod = {
        id: this.didDoc.id+'#'+`eip155:1:${this.address}`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: this.didDoc.id,
        blockchainAccountId: `eip155:1:${this.address}`,
    }        
      this.publicKeyMultibase=this.base64toMultibase58(this.userPublicKeyMultibase)
      this.keyAgreementKeyPair = {
        id: this.didDoc.id+'#'+this.publicKeyMultibase,
        type: 'X25519KeyAgreementKeyEIP5630',
        controller: this.didDoc.id,
        publicKeyMultibase:this.publicKeyMultibase,
    }    
      this.edvClient = new HypersignEdvClientEcdsaSecp256k1({
        url:'https://stage.hypermine.in/vault',
        keyAgreement:this.keyAgreementKeyPair,        
        verificationMethod
      })    
      const config = {
        edvId:`hs:edv:${this.didDoc.id}`,
        verificationMethod: verificationMethod,
        keyAgreement:this.keyAgreementKeyPair
      }      
      await this.edvClient.registerEdv(config)     
    },
    async syncEdv(){
      const res1 = await this.edvClient.insertDoc({
        document:this.issuedCred,
        edvId: `hs:edv:${this.didDoc.id}`,
        recipients: [{
            id:this.didDoc.id.split('#')[0] + '#' + this.keyAgreementKeyPair.publicKeyMultibase,
            type:'X25519KeyAgreementKeyEIP5630',
            }],
    })
    console.log(res1)
    },
    async decryptVc(encCred){
      this.showDecryptedCred = null
      try {
        const decryptDoc = await this.edvClient.decryptDocument({
          encryptedDocument:encCred.encryptedData,
          recipient:{
              id: this.keyAgreementKeyPair.id,
              type: 'X25519KeyAgreementKeyEIP5630'
          }
        })      
      this.showDecryptedCred = decryptDoc
      this.$root.$emit("bv::show::modal", "decrypted-vc"); 
      } catch (error) {
        this.toast(error,'error')
      }     
    },
    base64toMultibase58(base64) {
      const buffer = Buffer.from(base64, 'base64');
      const base58 = multibase.encode('base58btc', buffer);      
      return Buffer.from(base58).toString();
    },
    async resolveDiDDoc() {
      this.resolvedDiDDocument = await this.hypersigndid.resolve({
        did: this.didDoc.id,
      });      
      this.$root.$emit("bv::show::modal", "view-didDoc");      
    },
    async signAndRegDiDDoc() {
      try {
        const web3Instance = new Web3(window.web3.currentProvider);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });        
        window.web3 = web3Instance;

        this.signedDiDDOC = await this.hypersigndid.signByClientSpec({
          didDocument: this.didDoc,
          clientSpec: "eth-personalSign",
          address: accounts[0],
          web3: web3Instance,
        });        
        const signInfos = [
          {
            verification_method_id: this.didDoc.verificationMethod[0].id,
            signature: this.signedDiDDOC.signature,
            clientSpec: { type: "eth-personalSign" },
          },
        ];       
        const result = await this.hypersigndid.registerByClientSpec({
          didDocument: this.signedDiDDOC.didDocument,
          signInfos,
        });        
      } catch (error) {        
        this.toast(error, "error");
      }
    },
    async updateDidDoc() {},
    async generateCred() {
      try {            
      let attributeMap = [];
      let dataToSend;
      if (this.issueCredAttributes.length > 0) {
        this.issueCredAttributes.forEach((e) => {
          if (e.value === "") {
            throw new Error("enter value for credential attribute")
          }
          dataToSend = {
            [e.name]: e.value,
          };          
          attributeMap.push(dataToSend);         
        });
      }      
      const objj = Object.assign({}, ...attributeMap);     
      const credentialBody = {
        schemaId: this.schemaId,
        subjectDid: this.didDoc.id,
        issuerDid:
          "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
        fields: objj,
        expirationDate: "2027-12-10T18:30:00.000Z",
      };
      const credential = await this.hypersignVC.generate(credentialBody);      
      return credential
      } catch (error) {
       return this.toast(error,'error')
      }
     
    },
    async issueCred() {
      try {
         if(this.didDoc===null){
        throw new Error('Connect your Metamask and generate DID Document in DID Tab')
      }
      if(this.schemaId===""){
        throw new Error('Enter the Schema ID and Resolve')
      }
      const credential = await this.generateCred();     
      if(credential===undefined){
        throw new Error('Enter values for all credential attributes')
      }      
      this.generatedVC = credential;      
      const tempIssueCredentialBody = {
        credential: this.generatedVC, // unsigned credential generated using `generated()` method
        issuerDid:
          "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC",
        verificationMethodId:
          "did:hid:testnet:z49oshjFRVej8tWzfShGSnB3w1DN3gjUaXuUFR2BVJJeC#key-1",
        privateKeyMultibase: this.privateKey,
      };

      const issuedCredResult = await this.hypersignVC.issue(
        tempIssueCredentialBody
      );      
      this.issuedCred = issuedCredResult.signedCredential;
      const {
        signedCredential,
        credentialStatus,
        credentialStatusProof,
        credentialStatusRegistrationResult,
      } = issuedCredResult;
      console.log("signedCredential", signedCredential);
      console.log("credentialStatus", credentialStatus);
      console.log("credentialStatusProof", credentialStatusProof);
      console.log("credentialStatusRegistrationResult",credentialStatusRegistrationResult);
      this.vcId= this.issuedCred.id
      if(credentialStatusRegistrationResult.code === 0){
        this.toast('Credential Issued Successfully','success')
      }
      this.$root.$emit("bv::show::modal", "issued-vc");
      
      } catch (error) {
        this.toast(error,'error')
      }
     
    },
    
    addAttributes() {
      if (this.selectedAtt.name === "" || this.selectedAtt.type === null) {
        return this.toast("Enter Atrribute fields", "error");
      }
      this.attributes.push(this.selectedAtt);      
      const obj = {
        name: this.selectedAtt.name,
        type: this.selectedAtt.type,
        isRequired: this.selectedAtt.required,
      };      
      this.schemaBody.fields.push(obj);
      this.clearAttrField();
    },
    clearAttrField() {
      this.selectedAtt = {
        name: "",
        type: null,
        required: false,
      };
    },
  },
  mixins: [toast],
};
</script>

<style scoped>
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.blink {
  animation: blink 1s infinite;
}
.selected-media-wrapper {
  border: 1px dashed;
  max-height: 100px;
  background-color: #f5f5f5;
  border-radius: 10px;
}
.custom-card {
  width: 100%;
}
.didDocContainer {
  background: wheat;
  border-radius: 5px;
  margin-top: 2%;
  padding: 2%;
  text-align: left;
}
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
