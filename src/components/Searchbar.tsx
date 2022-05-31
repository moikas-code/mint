import React from 'react';
import Input from './common/input';
export default function SearhBar({
  label,
  placeholder,
  value,
  errorMessage = '',
  formStyle,
  onSubmit,
  onChange,
  isError,
}: {
  label: string;
  placeholder: string;
  value: string;
  errorMessage?: string;
  formStyle?: string;
  onSubmit: () => {};
  onChange: (e: string) => void;
  isError?: boolean;
}) {
  return (
    <>
      <style global jsx>
        {`
          .searchbar {
            width: 100%;
          }
          .outline-focus:focus-visible {
            outline-color: #dc3545 !important;
          }
          .err-msg {
            padding: 2rem;
            top: 35px;
            background: #fff;
          }
        `}
      </style>
      <form
        className={`position-relative searchbar d-flex flex-column justify-content-center ${
          typeof formStyle === 'string' ? formStyle : ''
        }`}
        onSubmit={async (e) => {
          e.preventDefault();
          onSubmit();
          return false;
        }}>
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            e.isDefaultPrevented();
            onChange(e.target.value);
          }}
          type='text'
          inputStyle={` ${
            isError ? 'border border-danger outline-focus' : ''
          } `}
        />
        {isError && (
          <div className='position-absolute err-msg'>
            <p className='m-0'>{errorMessage}</p>
          </div>
        )}
      </form>
    </>
  );
}
