import PassphraseInputs from "./PassPhraseInputs";
import { useState, useEffect } from "react";

// CreatePassphrase is a component used for creating new passphrases
const CreatePassphrase = ({ onSubmit, onChange, props }) => {
  const [passphrase, setPassphrase] = useState(null);
  const [newPassphrase, setNewpassphrase] = useState(null);
  const [passphraseConfirm, setPassphraseConfirm] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(!!newPassphrase &&
      newPassphrase === passphraseConfirm);
  }, [newPassphrase, passphraseConfirm]);

  // if on change is passed, we change its value if isValid is true.
  useEffect(() => {
    isValid && onChange(newPassphrase);
  }, [isValid]);

  const onKeyDown = (e) => {
    // Enter key
    if (e.keyCode == 13) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <PassphraseInputs
      {...{
        ...props,
        passphrase,
        newPassphrase,
        setNewpassphrase,
        passphraseConfirm,
        isValid,
        setPassphrase,
        setPassphraseConfirm,
        onKeyDown
      }}
    />
  );
}

CreatePassphrase.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default CreatePassphrase;
