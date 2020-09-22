import { DEXConfigPage } from "./DEXConfigPage";
import { useDEXPage } from "../hooks";
import { useState } from "react";

const DEXConfig = ({ user, }) => {
    const { onGetFee } = useDEXPage();
    const [formErrors, setFormErrors] = useState({});

    onGetFee().then(r => console.log(r)).catch(err => console.log(err));

    return <DEXConfigPage {...{ user, formErrors }} />;
};

export default DEXConfig;