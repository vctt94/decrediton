import DEXConfigPage from "./DEXConfigPage";
import { useDEXPage } from "../hooks";
import { useState } from "react";
import fs from "fs";

const addr = "dex-test.ssgen.io:7232";
const cert = fs.readFileSync("/home/vctt/.dexc/dex-test.ssgen.io.cert").toString()

const DEXConfig = ({ user, }) => {
  const { onGetFee } = useDEXPage();
  const [formErrors, setFormErrors] = useState({});
  const [configStep, setConfigStep] = useState(0);

  onGetFee(addr, cert).then(r => console.log(r)).catch(err => console.log(err));

  return <DEXConfigPage {...{ user, formErrors, configStep }} />;
};

export default DEXConfig;
