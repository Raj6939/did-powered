import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { Bip39, Slip10, Slip10RawIndex, Slip10Curve } from '@cosmjs/crypto';

export function makeCosmoshubPath(a) {
    return [
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(118),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(a),
    ];
}

export const createWallet = async (mnemonic) => {    
    if (!mnemonic) {
      return await DirectSecp256k1HdWallet.generate(
        24,
        ({
          prefix: 'hid',
          hdPaths: [makeCosmoshubPath(0)],
        })
      );
    } else {
      return await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        ({
          prefix: 'hid',
          hdPaths: [makeCosmoshubPath(0)],
        })
      );
    }
  };

  ////////////////  

function makeSSIWalletPath(minHardIndex) {
    return [

        Slip10RawIndex.hardened(118),
        Slip10RawIndex.hardened(128),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.hardened(minHardIndex),

    ];
}

export async function generateMnemonicToHDSeed(mnemonic, minHardIndex = 0) {
    minHardIndex=minHardIndex+1;
    const seed = Bip39.decode(mnemonic)
    const slipPathKeys = Slip10.derivePath(Slip10Curve.Ed25519, seed, makeSSIWalletPath(minHardIndex))
    const seedHD = slipPathKeys.privkey
    return seedHD;
}