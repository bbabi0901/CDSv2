// modules
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract, EventData } from 'web3-eth-contract';

// atoms
import { walletState, IWalletTypes } from '../../atoms/Atoms';

// abi
import { cdsLoungeAbi, cdsLoungeAddress } from '../abi/cdsLounge';

// address 입력하면 contract를 포함한 객체와 setter 반환하는 훅

export default class CDSLounge {}
