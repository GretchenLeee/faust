import React, { useEffect, useMemo, useState } from "react";
import {
  CredentialInfo,
  SismoClient,
  SismoGroupInfo,
} from "faust-sismo-client";
import {
  AuthType,
  ClaimRequest,
  SismoConnectButton,
} from "@sismo-core/sismo-connect-react";
import { useStore } from "@dataverse/hooks";
import { WalletProvider } from "@dataverse/wallet-provider";
import { ethers } from "ethers";
import { useAppStore } from "../../store";
import { abiCoder } from "../../utils";
import { Reputation } from "../../components";
import { Button, Card, Skeleton } from "antd";
import "./index.scss";
import TextArea from "antd/es/input/TextArea";
import { FileDoneOutlined } from "@ant-design/icons";

export const Verify: React.FC = () => {
  const { address } = useStore();
  const { sismoClient, setSismoClient } = useAppStore();

  const [credentialInfoList, setCredentialInfoList] =
    useState<CredentialInfo[]>();
  const [groupInfoList, setGroupInfoList] = useState<SismoGroupInfo[]>();
  const [responseBytes, setResponseBytes] = useState<string>();
  const [isBindLoading, setIsBindLoading] = useState<boolean>(false);

  console.log("reposneBytes:", responseBytes);

  useEffect(() => {
    if (!sismoClient) {
      initSismoClient();
    }
  }, []);

  useEffect(() => {
    if (sismoClient && credentialInfoList) {
      (async () => {
        const settleList = await Promise.allSettled(
          credentialInfoList.map((reputationInfo) =>
            sismoClient.getSismoGroupInfo(reputationInfo.groupId)
          )
        );
        const groupInfoList: SismoGroupInfo[] = [];
        settleList.map((elem) => {
          if (elem.status === "fulfilled") {
            groupInfoList.push(elem.value);
          }
        });
        setGroupInfoList(groupInfoList);
      })();
    }
  }, [credentialInfoList]);

  const sismoClaims: ClaimRequest[] = useMemo(() => {
    if (credentialInfoList) {
      return credentialInfoList.map((credentialInfo: CredentialInfo) => {
        return {
          groupId: credentialInfo.groupId,
          isOptional: true,
        };
      });
    } else {
      return [];
    }
  }, [credentialInfoList]);

  useEffect(() => {
    if (address && sismoClient) {
      getCredentialInfoList();
    }
  }, [address, sismoClient]);

  const initSismoClient = async () => {
    const walletProvider = new WalletProvider();

    const res = await walletProvider.getCurrentWallet();
    if (res && res.address && res.wallet) {
      walletProvider.connectWallet(res.wallet);
    }
    const web3Provider = new ethers.providers.Web3Provider(walletProvider);
    const signer = web3Provider.getSigner();

    const sismoClient = new SismoClient({
      contractAddr: "0x1013dc7705ba4beda0fd5801ff2f92cae1678839",
      signer,
    });

    setSismoClient(sismoClient);
  };

  const handleBindCredential = async () => {
    if (!responseBytes) {
      throw new Error("responseBytes undefined!");
    }
    if (!address) {
      throw new Error("Address undefined!");
    }
    if (isBindLoading) {
      return;
    }
    try {
      setIsBindLoading(true);
      const result = await sismoClient?.bindCredential({
        accountAddress: address,
        responseBytes,
      });
      console.log("bindCredential result:", result);
      getCredentialInfoList();
    } catch (error) {
      console.error(error);
    } finally {
      setIsBindLoading(false);
    }
  };

  const getCredentialInfoList = async () => {
    if (!address) {
      throw new Error("Address undefined!");
    }
    const result = await sismoClient?.getCredentialInfoList(address);
    console.log("getCredentialInfoList result:", result);
    setCredentialInfoList(result);
  };

  return (
    <div id="verify">
      <Card
        className="card-area credential"
        title="Credentials"
        bordered={false}
        hoverable
      >
        {credentialInfoList && groupInfoList ? (
          <Reputation
            credentialInfoList={credentialInfoList}
            groupInfoList={groupInfoList}
          />
        ) : (
          <>
            <Skeleton avatar paragraph={{ rows: 1 }} />
            <Skeleton avatar paragraph={{ rows: 1 }} />
            <Skeleton avatar paragraph={{ rows: 1 }} />
          </>
        )}
      </Card>

      <Card className="card-area" hoverable>
        <SismoConnectButton
          disabled={address ? false : true}
          config={{
            appId: "0x7dda505afadebf432bb5d3a00c896fb6",
          }}
          auths={[{ authType: AuthType.VAULT }]}
          claims={sismoClaims}
          signature={
            address
              ? {
                  message: abiCoder.encode(["address"], [address]),
                }
              : undefined
          }
          onResponseBytes={(responseBytes: string) => {
            setResponseBytes(responseBytes);
          }}
        />

        <div className="bytes-area">
          <TextArea
            rows={4}
            placeholder="'Sign in with Sismo' and select data groups, then genreate zk proof finnaly 'Verify on Chain'."
            disabled
            value={responseBytes}
          />
        </div>

        <div className="button-area">
          <Button
            className="button-area__button"
            type="primary"
            size="large"
            disabled={responseBytes === undefined}
            onClick={handleBindCredential}
            loading={isBindLoading}
            icon={<FileDoneOutlined rev={undefined} />}
          >
            Verify On Chain
          </Button>
        </div>
      </Card>
    </div>
  );
};
