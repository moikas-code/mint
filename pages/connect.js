import React from 'react';
import Link from 'next/link';
import {ConnectOptions} from '../src/views/connect/connect-options';
export default function Connect() {
  return (
    <>
      <style jsx>{``}</style>
      <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
        <p>Please Connect to Continue with App</p>
        {<ConnectOptions />}
        <Link href={'/'}>
          <a className='fnt-color-black text-decoration-none'>Go Back</a>
        </Link>
      </div>
    </>
  );
}
