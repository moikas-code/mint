import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {ConnectOptions} from '../src/views/connect/connect-options';
//@ts-ignore
import {ConnectorContext} from '@/src/components/connector/sdk-connection-provider';

export default function Connect() {
  const router = useRouter();
  const connection = React.useContext(ConnectorContext);

  return (
    <>
      <style jsx>{``}</style>
      <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
        <p>Please Connect to Continue with App</p>
        <ConnectOptions />
        <Link href={'/'}>
          <a className='fnt-color-black text-decoration-none'>Go Back</a>
        </Link>
      </div>
    </>
  );
}
