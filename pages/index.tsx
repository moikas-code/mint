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

  const _blockchain =
    typeof connection?.walletAddress?.split(':')[0] !== 'undefined'
      ? connection?.walletAddress?.split(':')[0]
      : '';
  const _address: string = connection.walletAddress?.split(':')[1];

  const [contractAddress, setContractAddress] = useState<any>({});
  const [complete, setComplete] = useState<boolean>(false);
  const [_error, setError] = useState<any>('');
  const [show, setShow] = useState<boolean>(false);
  const [showListText, setShowListText] = useState<boolean>(false);
  const [nftid, setNFTID] = useState<any>(null);
  const [continuation, setContinuation] = useState<string | string[]>('');
  const [price, setPrice] = useState<number>(0);
  const [listNFT, setListNFT] = useState<boolean>(false);
  const [supply, setSupply] = useState<number>(1);
  const [lazyMint, setLazyMint] = useState<boolean>(false);
  const [royalties, setRoyalties] = useState<number>(0);
  const [collections, setCollections] = useState<Array<any>>([]);

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
    onCompleted: async ({Owned_Collections}) => {
      if (Owned_Collections !== null && Owned_Collections !== undefined) {
        let cleanCollections: Array<any> = [];
        console.log(Owned_Collections);
        for await (var collection of Owned_Collections.collections.filter(
          ({features}) =>
            features.includes('MINT_WITH_ADDRESS' || 'MINT_AND_TRANSFER')
        )) {
          async function getNFTTotal(id) {
            const nftTotal = await TAKO.get_nfts_by_collection({
              sdk,
              collection: id,
            });
            return nftTotal.total;
          }

          const total = await getNFTTotal(collection.id);
          if (
            ![
              'POLYGON:0xe9722a06a7f2ec8523c1aa70cbead9743c7e776c',
              'POLYGON:0x2a890a07f9805f1338f4c6aede84ec45b77fa335',
              'POLYGON:0x37f5694f04bd9a9c6c0d2c2629f6a70bbfdef3ff',
              'ETHEREUM:0x2e24c674ac13eff59c0e289ceb63e0c8e696e152',
              'POLYGON:0x05dd2e2986a5bde3dd98fd49f7f7e4c0517c8811',
              'POLYGON:0x72922f1de9a9a7b19009e9b05b918f29280e0ce1',
              'POLYGON:0x5ed105bb186613163169685519ac8ec7c2f1aa48',
              'POLYGON:0x761769937e86a838ec63acca2f035cefdec12c0c',
              'POLYGON:0xa92d3e618f54817c53ec7e92f24659eff59e7a02',
              'POLYGON:0xc50ab6be157f08020787b8cb11d631fcce78e3dd',
              'POLYGON:0xc58529ab24db69a2a4d8aeb3ed1a9f50dbf16fa1',
              'POLYGON:0xfd5af2d8acb567fe8033112b4398351147d6d358',
              'POLYGON:0x3c798ac3ba87a9abd550c3040862f14508b87308',
              'POLYGON:0x84842a1c4016c917c64c2b52664f264d1876eda4',
              'POLYGON:0x4cb1bc245fe0f0e1e15ec9d97fe00479079f5cb9',
              'POLYGON:0x99e508775089e093c0adb0e25a5573d5f2fca4a8',
            ].includes(collection.id)
          ) {
            cleanCollections.push({
              label: `${collection.name} | ${collection.type} | # of items: ${total}`,
              value: collection.id,
              type: collection.type,
              total,
            });
          }
        }

        setCollections(cleanCollections.sort((a, b) => b.total - a.total));
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
    setLazyMint(false);
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
      connection.state.status === 'initializing' ||
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
      ) : !show ? (
        <div className='nft-form w-100 d-flex flex-column justify-content-center mx-auto'>
          <div className='d-flex flex-column border border-dark m-5 h-100'>
            {/* TOP SECTION */}
            <div
              className={`col p-2 border border-dark d-inline-flex flex-column w-100 form-mx`}>
              <p>Your Network: {_blockchain}</p>
              <p>{error}</p>
              <div className='col pb-3 p-2 border border-dark'>
                <p className='mb-0'>Contract Type* (select one)</p>
                <Select
                  className='text-black h-100 w-100'
                  options={((): any => {
                    switch (_blockchain) {
                      case 'POLYGON':
                        return [
                          {
                            label: 'AKKOROS ERC721 (Singles) | Shared',
                            value:
                              'POLYGON:0x2a890a07f9805f1338f4c6aede84ec45b77fa335',
                            type: 'ERC721',
                          },
                          {
                            label: 'AKKOROS ERC1155 (Multiples) | Shared',
                            value:
                              'POLYGON:0x37f5694f04bd9a9c6c0d2c2629f6a70bbfdef3ff',
                            type: 'ERC1155',
                          },
                          ...collections,
                        ];
                      case 'ETHEREUM':
                        return [
                          {
                            label: 'RARIBLE ERC721 (Singles) | Shared',
                            value:
                              'ETHEREUM:0xF6793dA657495ffeFF9Ee6350824910Abc21356C',
                            type: 'ERC721',
                          },
                          {
                            label: 'RARIBLE ERC1155 (Multiples) | Shared',
                            value:
                              'ETHEREUM:0xB66a603f4cFe17e3D27B87a8BfCaD319856518B855',
                            type: 'ERC1155',
                          },
                          ...collections,
                        ];
                      case 'TEZOS':
                        return [
                          {
                            label: 'RARIBLE | Shared',
                            value: 'TEZOS:KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS',
                            type: 'NFT',
                          },
                          ...collections,
                        ];
                      case 'FLOW':
                        return [
                          {
                            label: 'RARIBLE | Shared',
                            value: 'FLOW:A.01ab36aaf654a13e.RaribleNFT',
                            type: 'NFT',
                          },
                          ...collections,
                        ];
                      case 'SOLANA':
                        return [
                          {
                            label: 'RARIBLE | Shared',
                            value:
                              'SOLANA:metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                            type: 'NFT',
                          },
                          ...collections,
                        ];

                      default:
                        return collections;
                    }
                  })()}
                  value={contractAddress}
                  onChange={(e: any) => {
                    setContractAddress(e);
                    setSupply(1);
                  }}
                />
              </div>
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

              {typeof contractAddress.type !== 'undefined' &&
                contractAddress.type !== 'ERC721' &&
                contractAddress.type !== 'NFT' && (
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

            <div
              className={`col p-2 border border-dark d-inline-flex flex-column w-100 form-mx`}>
              {_blockchain === 'ETHEREUM' && (
                <>
                  <ToggleButton
                    label={
                      <>
                        <span className='mb-3'>
                          Enable Lazy Minting (Free Minting)
                          <br />
                          {lazyMint
                            ? 'NFT Will Be Off-Chain Until Purchased or Transferred'
                            : 'NFT Will Be On-Chain'}
                        </span>
                      </>
                    }
                    getToggleStatus={(e) => {
                      setLazyMint(e);
                    }}
                    defaultStatus={lazyMint}
                  />
                </>
              )}
              <hr />
              {
                <>
                  <ToggleButton
                    label={
                      <>
                        <span className='mb-3'>List NFT</span> - We charge a
                        0.05% Listing Fee when purchased to help keep the lights
                        on
                      </>
                    }
                    getToggleStatus={(e) => {
                      setListNFT(e);
                    }}
                    defaultStatus={listNFT}
                  />
                </>
              }
              {listNFT && (
                <div className='d-flex flex-column'>
                  Token Price: {price}
                  (Listed in Your Chains Native Token)
                  <Input
                    id={'token-price'}
                    label={'NFT Price'}
                    type={'number'}
                    value={price}
                    placeholder={price}
                    inputStyle={''}
                    onChange={(e: any) => {
                      const {value} = e.target;

                      value !== undefined && parseInt(value) > 1000000000
                        ? setPrice(10000000000)
                        : value !== undefined && parseInt(value) < 0
                        ? setPrice(0)
                        : value == undefined || value == null || value == ''
                        ? setPrice(0)
                        : setPrice(value);
                    }}
                  />
                  (You will receive a signature to approve your listing after
                  minting. )
                </div>
              )}
              <hr />
              By Pressing Sumbit You Are Stating That You Are Authorized To
              Upload The Following File To The Blockchain and IPFS as The Owner
              and take Responsibility for any Damages or License Issues that May
              Occur.
              <hr />
              <div
                className={`d-flex flex-column w-100 justify-content-center`}>
                <br />
                <Button
                  disabled={
                    supply === 0 ||
                    state.name.length === 0 ||
                    typeof contractAddress !== 'object' ||
                    state.fileData.length === 0
                  }
                  className={`btn btn-dark`}
                  onClick={async () => {
                    await setState({...state, isLoading: true});
                    setShow(true);
                    const json = JSON.stringify({
                      ..._metadata,
                      name: state.name,
                      symbol: 'TAKO',
                      description: state.description,
                      image: state.fileData,
                      animation_url: state.animation_url,
                      platform_url: 'https://mint.takolabs.io',
                      seller_fee_basis_points: royalties * 100 || 0,
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
                        ,
                        {
                          trait_type: 'Platform URL',
                          value: 'https://mint.takolabs.io',
                        },
                      ],
                      properties: {
                        creators: [
                          {
                            address: _address,
                            share: 100,
                          },
                        ],

                        ...state.properties,
                      },
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
                        console.log(
                          _blockchain + ':' + _address,
                          contractAddress.value
                        );
                        const _nft = await TAKO.mint({
                          sdk,
                          collection: contractAddress.value,
                          data: {
                            uri: 'https://ipfs.io/ipfs/' + cid,
                            supply: supply > 0 ? supply : 1,
                            lazyMint: lazyMint,
                            royalties: [
                              {
                                account: _blockchain + ':' + _address,
                                value: royalties * 100,
                              },
                            ],
                          },
                        });
                        console.log('NFT', _nft);
                        if (_nft.status === 500) {
                          setShow(false);
                          setError('Rarible Server Error');
                        } else if (_nft.code === 4001) {
                          setShow(false);
                          setError('User Cancelled Transaction');
                        } else if (_nft.code === parseInt('-32603')) {
                          setShow(false);
                          setError(
                            'Transaction Underpriced, Please Try Again and Check your Gas'
                          );
                        } else {
                          setNFTID(_nft);
                          return _nft;
                        }
                      })
                      .then(async (sell_nft) => {
                        sell_nft !== undefined &&
                          listNFT &&
                          setShowListText(true);
                        sell_nft !== undefined &&
                          listNFT &&
                          (await TAKO.sell_nft({
                            sdk,
                            price,
                            amount: supply,
                            blockchain: _blockchain,
                            nft_id: sell_nft,
                          }));
                        setSupply(1);
                        setState({
                          ..._metadata,
                          name: '',
                          description: '',
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
                  Submit
                </Button>
                <p className='mx-auto'>
                  Make sure to check your Gas before you approve to ensure your
                  transaction goes through
                </p>
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
              <p>
                Built on{' '}
                <a
                  target={'_blank'}
                  rel={'norefferal'}
                  href={'https://rarible.org'}>
                  The Rarible Protocol
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='h-100 w-100 d-flex flex-column justify-content-center align-items-center'>
          <h1>MINT | Tako Labs</h1>
          <hr />
          <p>Mint Your NFT's with Us ❤</p>
          {!showListText && <p>Listing</p>}
          {nftid === null ? (
            <p>Minting</p>
          ) : (
            <p>
              <a
                target={'_blank'}
                href={`https://rarible.com/token/${
                  nftid.split(':')[0] === 'ETHEREUM'
                    ? ''
                    : nftid.split(':')[0].toLowerCase()
                }/${nftid.split(':')[1]}:${nftid.split(':')[2]}?tab=details`}>
                {/* {`${JSON.stringify(nftid)}`} */}
                Your NFT on Rarible
              </a>
            </p>
          )}
          <Button
            className={'btn btn-outline-dark'}
            onClick={() => {
              setShow(false);
              setError('');
            }}>
            Close
          </Button>
          <br />
        </div>
      )}
    </>
  );
}
