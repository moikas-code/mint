import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
//@ts-ignore
import {ConnectorContext} from '@/src/components/connector/sdk-connection-provider';

import Select from 'react-select';
//@ts-ignore
import SEO from '@/src/components/SEO';
// @ts-ignore
import Button from '@/src/components/common/button';
// @ts-ignore
import Modal from '@/src/components/common/modal';
// @ts-ignore
import Input from '@/src/components/common/input';
// @ts-ignore
import ToggleButton from '@/src/components/ToggleButton';
// @ts-ignore
import TAKO from '@/src/tako';
import {gql, useLazyQuery} from '@apollo/client';
// @ts-ignore
import {_metadata, _metadataTypes} from '../src/lib/metadataSchema';
// @ts-ignore
import FormInputs from '../src/components/FormInputs';
// @ts-ignore
import nft from '../src/lib/nft-storage';
// @ts-ignore
import MediaViewer from '../src/components/media-viewer';

import Navbar from '../src/components/Navbar';
import {
  toUnionAddress,
  UnionAddress,
  BigNumber,
  toBigNumber,
} from '@rarible/types';
import NFTInput from '../src/components/NFTInput';
import {ConnectOptions} from '../src/views/connect/connect-options';
type MintFormProps = any;
interface NFTFormProps extends MintFormProps {
  address: UnionAddress;
  sdk: any;
  wallerAddress: any;
}

export default function Dragon() {
  const router = useRouter();
  const connection = React.useContext<any>(ConnectorContext);
  const sdk: string = connection.sdk;
  const _blockchain: string = connection.sdk?.wallet?.blockchain;
  const _address: string = connection.walletAddress;

  const [contractAddress, setContractAddress] = useState<string>('');
  const [complete, setComplete] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [continuation, setContinuation] = useState<string | string[]>('');
  const [supply, setSupply] = useState<number>(1);
  const [lazyMint, setLazyMint] = useState<boolean>(true);
  const [royalties, setRoyalties] = useState<number>(0);

  const [state, setState] = useState({
    ..._metadata,
    type: '',
    mimeType: '',
    attributes: [],
    token: '',
    disable: true,
    showInput: false,
    showMedia: false,
    isLoading: false,
    cid: '',
    canMint: false,
    fileData: '',
  });

  const query = gql`
    query Collections($input: QueryInput!) {
      Owned_Collections(input: $input) {
        total
        continuation
        collections {
          id
          parent
          blockchain
          type
          name
          symbol
          owner
          features
          minters
          meta {
            name
            description
            content {
              width
              height
              url
              representation
              mimeType
              size
            }
            externalLink
            sellerFeeBasisPoints
            feeRecipient
          }
        }
      }
    }
  `;
  const [Owned_Collections, {loading, error, data}] = useLazyQuery(query, {
    onCompleted: ({Owned_Collections}) => {
      if (Owned_Collections !== null && Owned_Collections !== undefined) {
        console.log(Owned_Collections);
        setComplete(true);
      }
    },
  });

  const handleFormResponses = (e: any, data: any) => {
    if (
      _metadataTypes[data + 'Type'] == 'string' ||
      _metadataTypes[data + 'Type'] == 'url' ||
      _metadataTypes[data + 'Type'] == 'color'
    ) {
      setState({...state, [data]: e.target.value});
    }
  };

  useEffect((): any => {
    typeof _address !== 'undefined' &&
      typeof _blockchain !== 'undefined' &&
      Owned_Collections({
        variables: {
          input: {
            blockChain: _blockchain,
            address: _address,
            continuation: continuation,
            size: 100,
          },
        },
      });

    return () => {
      setComplete(false);
    };
  }, [_address, _blockchain]);

  if (loading) {
    return (
      <div className='h-100 w-100 d-flex flex-column justify-content-center align-items-center'>
        <h1>MINT | Tako Labs</h1>
        <hr />
        <p>Mint Your NFT's with Us ❤</p>
        <br />
        Loading
      </div>
    );
  }
 return (
    <>
      <style jsx>
        {`
          .nft-form {
            max-width: 800px;
          }
          .nft-wrapper {
            width: 200px;
          }
          .icon-wrapper {
            height: 300px;
            max-width: 800px;
          }
        `}
      </style>
      <SEO
        title={`Tako Labs - MINT`}
        description='TAKOLABS.IO: Tako Labs is a WEB3 Community that is focused on the development of decentralized applications and services as well providing gaming content.'
        twitter='takolabs'
        keywords='gaming, nfts, web3'
      />
      <Navbar />
      {connection.state.status === 'disconnected' ||
      connection.state.status === 'initializing'  ||
      connection === undefined ||
      typeof connection === 'undefined' ? (
        <div className='h-100 w-100 d-flex flex-column justify-content-center align-items-center'>
          <h1>MINT | Tako Labs</h1>
          <hr />
          <p>Mint Your NFT's with Us ❤</p>
          <p>Please Connect to Continue with App</p>
          <Button
            className={'btn btn-outline-dark'}
            onClick={() => {
              router.push('/connect');
            }}>
            Connect
          </Button>
          <br />
        </div>
      ) : (
        <div className='nft-form w-100 d-flex flex-column justify-content-center mx-auto'>
          <div className='d-flex flex-column border border-dark m-5 h-100 w-100'>
            {/* TOP SECTION */}
            <div
              className={`col p-2 border border-dark d-inline-flex flex-column w-100 form-mx`}>
              <p>Your Network: {_blockchain}</p>
              {Object.keys(_metadata).map((data, key) => (
                <FormInputs
                  show={data === 'image' || state.showInput}
                  key={key}
                  id={data}
                  label={data.replace('_', ' ')}
                  type={_metadataTypes[data + 'Type']}
                  onChange={(e: any) => handleFormResponses(e, data)}
                  style={`w-100`}
                />
              ))}
              {false && (
                <div className='d-flex flex-column'>
                  Token Supply: {supply}
                  <Input
                    id={'token-supply'}
                    label={'NFT Supply'}
                    type={'number'}
                    value={supply.toString()}
                    placeholder={supply.toString()}
                    inputStyle={''}
                    onChange={(e: any) => {
                      const {value} = e.target;
                      value !== undefined && parseInt(value) > 1000000000
                        ? setSupply(10000000000)
                        : value !== undefined && parseInt(value) < 0
                        ? setSupply(1)
                        : value == undefined || value == null || value == ''
                        ? setSupply(1)
                        : setSupply(parseInt(value.match(/\d+/gi).join('')));
                    }}
                  />
                  <hr />
                </div>
              )}
              <>
                Royalties: {royalties}%
                <Input
                  id={'royalties'}
                  label={'NFT Royalties'}
                  type={'range'}
                  min={0}
                  max={50}
                  value={royalties}
                  inputStyle={'w-100'}
                  onChange={(e: any) => {
                    const {value} = e.target;
                    setRoyalties(parseInt(value));
                  }}
                />
                <hr />
              </>
            </div>
            <div className='d-flex flex-column col pb-1 p-2 border border-dark'>
              <div className='p-3'>
                <NFTInput
                  id={'nft-input'}
                  accept={'.png,.gif,.jpg, .jpeg,.tiff,.tif,.bmp,.svg,.webp'}
                  label={'Upload Image File:'}
                  onChange={async (e: any): Promise<void> => {
                    const {cid, fileType}: any = e;
                    console.log('?', cid, fileType);
                    setState({
                      ...state,
                      canMint:
                        fileType !== undefined &&
                        fileType.split('/')[0] == 'image'
                          ? true
                          : false,
                      fileData:
                        fileType !== undefined &&
                        fileType.split('/')[0] == 'image'
                          ? 'https://ipfs.io/ipfs/' + e.cid
                          : '',
                      animation_url:
                        fileType !== undefined &&
                        fileType.split('/')[0] !== 'image'
                          ? 'https://ipfs.io/ipfs/' + e.cid
                          : '',
                      type: fileType ? fileType.split('/')[0] : 'UNKNOWN',
                      showInput: true,
                      showMedia:
                        fileType !== undefined &&
                        fileType.split('/')[0] == 'image'
                          ? true
                          : false,
                      memeType:
                        fileType == 'application/zip'
                          ? 'application/zip'
                          : fileType,
                    });
                  }}
                />
                <br />

                {state.memeType !== undefined &&
                  state.memeType.split('/')[0] !== 'image' && (
                    <>
                      NFT COVER FOR VIDEO/AUDIO (NON IMAGE NFT)
                      <br />
                      <NFTInput
                        id={'nft-input-cover'}
                        label={'Cover:'}
                        accept={'image/*'}
                        onChange={async (e: any): Promise<void> => {
                          const {cid, fileType} = e;
                          setState({
                            ...state,
                            canMint:
                              fileType !== undefined &&
                              fileType.split('/')[0] == 'image'
                                ? true
                                : false,
                            fileData: 'https://ipfs.io/ipfs/' + cid,
                            disable: false,
                            memeType: fileType,
                            showMedia: true,
                          });
                        }}
                      />
                    </>
                  )}
              </div>
              {state.showMedia &&
                (state.fileData.length > 0 ||
                  state.animation_url.length > 0) && (
                  <>
                    <div className={'icon-wrapper mx-auto'}>
                      <img
                        className='h-100 w-auto'
                        src={state.fileData}
                        alt=''
                      />
                    </div>
                    <hr />
                  </>
                )}
            </div>

            <div className='col pb-3 p-2 border border-dark'>
              <p className='mb-0'>Contract Type* (select one)</p>
              <Select
                className='text-black h-100 w-100'
                options={((): any => {
                  switch (_blockchain) {
                    case 'POLYGON':
                    case 'ETHEREUM':
                      return [
                        {
                          label: 'RARIBLE ERC721 (Singles)',
                          value:
                            'ETHEREUM:0xF6793dA657495ffeFF9Ee6350824910Abc21356C',
                        },
                        {
                          label: 'RARIBLE ERC1155 (Multiples)',
                          value:
                            'ETHEREUM:0xB66a603f4cFe17e3D27B87a8BfCaD319856518B855',
                        },
                      ];
                    case 'TEZOS':
                      return [
                        {
                          label: 'RARIBLE',
                          value: 'TEZOS:KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS',
                        },
                        ,
                      ];
                    case 'FLOW':
                      return [
                        {
                          label: 'RARIBLE',
                          value: 'FLOW:A.01ab36aaf654a13e.RaribleNFT',
                        },
                        ,
                      ];

                    default:
                      break;
                  }
                })()}
                value={contractAddress}
                onChange={(e: any) => {
                  setContractAddress(e);
                  console.log(typeof e);
                }}
              />
            </div>
            <div
              className={`col p-2 border border-dark d-inline-flex flex-column w-100 form-mx`}>
              <ToggleButton
                label={
                  <>
                    <span className='mb-3'>
                      Enable Lazy Minting (Free Minting)
                      <br />
                      NFT Will Be Off-Chain Until Purchased or Transferred
                    </span>
                  </>
                }
                getToggleStatus={(e) => {
                  setLazyMint(e);
                }}
                defaultStatus={lazyMint}
              />
              <hr />
              <div className={`d-flex flex-column w-100`}>
                <Button
                  disabled={
                    state.name.length === 0 ||
                    state.description.length === 0 ||
                    typeof contractAddress !== 'object'
                  }
                  buttonStyle={`btn-dark`}
                  onClick={async () => {
                    await setState({...state, isLoading: true});
                    const json = JSON.stringify({
                      ..._metadata,
                      name: state.name,
                      description: state.description,
                      image: state.fileData,
                      animation_url: state.animation_url,
                      platform_url: 'https://mint.takolabs.io',
                      attributes: [
                        ...state.attributes,
                        {
                          trait_type: 'File Type',
                          value: state.type.toUpperCase(),
                        },
                        {
                          trait_type: 'Platform',
                          value: 'TAKO LABS',
                        },
                      ],
                      properties: state.properties,
                    });

                    await nft
                      .storeFileAsBlob(json)
                      .then((_tkn) => {
                        setState({
                          ...state,
                          token: _tkn,
                          disable: !state.disable,
                          isLoading: false,
                        });
                        return _tkn;
                      })
                      .then(async (cid) => {
                        const _nft = await TAKO.mint({
                          sdk,
                          collection: toUnionAddress(contractAddress.value),
                          data: {
                            uri: 'ipfs://ipfs/' + cid,
                            supply: supply,
                            lazyMint: lazyMint,
                            royalties: [
                              {
                                account:
                                  contractAddress.value.split(':')[0] +
                                  ':' +
                                  _address,
                                value: royalties * 100,
                              },
                            ],
                          },
                        }).catch((err) => {
                          console.log(err.message);
                        });
                        console.log(_nft);
                        return _nft;
                        setShow(false);
                      })
                      .then(() => {
                        setState({
                          ..._metadata,
                          type: '',
                          mimeType: '',
                          attributes: [],
                          token: '',
                          disable: true,
                          showInput: false,
                          showMedia: false,
                          isLoading: false,
                          cid: '',
                          canMint: false,
                          fileData: '',
                        });
                      });
                  }}>
                  Mint
                </Button>
              </div>

              {state.token.length > 0 && (
                <>
                  <hr />
                  <div className='d-flex flex-column justify-content-around'>
                    Your Metadata:{' '}
                    <a
                      target={'_blank'}
                      rel='norefferal'
                      className='text-truncate'
                      href={`https://ipfs.io/ipfs/${state.token}`}>
                      https://ipfs.io/ipfs/{state.token}
                    </a>
                  </div>
                </>
              )}
              <hr />
              <p>
                Metadata powered by{' '}
                <a
                  target={'_blank'}
                  rel={'norefferal'}
                  href={'https://nft.storage'}>
                  NFT.Storage
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


