import "./index.scss";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Tag, Upload, Image, Select, Switch } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { Input } from "antd";
import { EditOutlined, GithubOutlined, LockOutlined } from "@ant-design/icons";
import { Currency, FileType } from "@dataverse/dataverse-connector";
import {
  StreamType,
  useCreateStream,
  useFeeds,
  useStore,
  useUnlockStream,
  useUpdateStream,
  useDatatokenInfo,
} from "@dataverse/hooks";
import { useAppStore } from "../../store";
import { abbreviateAddress, getAddressFromPkh } from "../../utils";
import LockImage from "../../assets/lock.svg";
import { WalletProvider } from "@dataverse/wallet-provider";
import { ethers } from "ethers";
import { SismoClient } from "faust-sismo-client";

export const Home: React.FC = () => {
  const { modelParser, appVersion, sortedStreamIds, setSortedStreamIds } =
    useAppStore();
  const { streamsMap } = useStore();
  const { sismoClient, setSismoClient } = useAppStore();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [postText, setPostText] = useState<string>();
  const [fileType, setFileType] = useState<FileType>(FileType.Public);
  const [currency, setCurrency] = useState<Currency>(Currency.WMATIC);
  const [amount, setAmount] = useState<string>("");
  const [isPostLoading, setIsPostLoading] = useState<boolean>(false);
  const [isUnlockLoading, setIsUnlockLoading] = useState<boolean>(false);
  const [addressList, setAddressList] = useState<string[]>([]);
  const [addressReputationsMap, setAddressReputationsMap] = useState<
    Record<string, string[]>
  >({});

  const postModelId = useMemo(() => {
    const postModel = modelParser.getModelByName("post");
    return postModel.streams[postModel.streams.length - 1].modelId;
  }, [modelParser]);

  useEffect(() => {
    initSismoClient();
  }, []);

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

  const imagesList = useMemo(() => {
    const urls: string[] = [];
    console.log("fileList:", fileList);
    fileList.map((file) => {
      if (file.response && file.response.status === "done") {
        urls.push(file.response.url);
      }
    });
    console.log("imagesList:", urls);
    return urls;
  }, [fileList]);

  useEffect(() => {
    loadFeeds(postModelId);
  }, [postModelId]);

  useEffect(() => {
    if (streamsMap) {
      const _sortedStreamIds = Object.keys(streamsMap)
        .filter(
          (el) =>
            streamsMap[el].pkh &&
            streamsMap[el].streamContent.content.appVersion === appVersion &&
            streamsMap[el].streamContent.file &&
            streamsMap[el].streamContent.file.fileType !== FileType.Private
        )
        .sort(
          (a, b) =>
            Date.parse(streamsMap[b].streamContent.content.createdAt) -
            Date.parse(streamsMap[a].streamContent.content.createdAt)
        );

      setSortedStreamIds(_sortedStreamIds);

      const _addressList = JSON.parse(JSON.stringify(addressList));
      Object.values(streamsMap).map((value) => {
        if (addressList.indexOf(getAddressFromPkh(value.pkh)) < 0) {
          _addressList.push(getAddressFromPkh(value.pkh));
        }
      });
      console.log("[[[]]]addressList:", addressList);
      setAddressList(_addressList);
    }
  }, [streamsMap]);

  useEffect(() => {
    if (streamsMap && sortedStreamIds) {
      const needDatatokenInfoStreamIds = sortedStreamIds.filter(
        (el) =>
          streamsMap[el].streamContent.file.fileType === FileType.Datatoken &&
          !streamsMap[el].datatokenInfo
      );
      needDatatokenInfoStreamIds.map((streamId) => getDatatokenInfo(streamId));
    }
  }, [sortedStreamIds]);

  useEffect(() => {
    console.log("addressList[[[]]]:", addressList);
    if (addressList) {
      console.log("initAddressReputationsMap, addressList:", addressList);
      initAddressReputationsMap();
    }
  }, [addressList.length]);

  const initAddressReputationsMap = async () => {
    if (!addressList || addressList.length === 0) return;
    const groupIds: string[] = await sismoClient.getGroupIds();
    const settleList = await Promise.allSettled(
      groupIds.map((groupId) => sismoClient.getSismoGroupInfo(groupId))
    );
    const getGroupNameById: Record<string, string> = {};
    settleList.map((elem, index) => {
      if (elem.status === "fulfilled") {
        getGroupNameById[groupIds[index]] = elem.value.name;
      }
    });

    const addressCredentialInfoList = await Promise.all(
      addressList.map((address) => {
        return sismoClient.getCredentialInfoList(address);
      })
    );

    const _addressReputationsMap: Record<string, string[]> = {};
    addressCredentialInfoList.map((credentialInfoList, index) => {
      const _credentialNameList: string[] = [];
      credentialInfoList.map((credentialInfo) => {
        if (credentialInfo.value) {
          _credentialNameList.push(getGroupNameById[credentialInfo.groupId]);
        }
      });
      _addressReputationsMap[addressList[index]] = _credentialNameList;
    });

    console.log("addressRepuatationsMap:", _addressReputationsMap);

    setAddressReputationsMap(_addressReputationsMap);
  };

  const { createStream: createPublicStream } = useCreateStream({
    streamType: StreamType.Public,
  });

  const { createStream: createPayableStream } = useCreateStream({
    streamType: StreamType.Payable,
  });

  const { unlockStream } = useUnlockStream({
    onSuccess: (result) => {
      console.log("[unlockPost]unlock stream success, result:", result);
    },
  });

  const { loadFeeds } = useFeeds({
    onSuccess: (result) => {
      console.log("[loadPosts]load streams success, result:", result);
    },
  });

  const { getDatatokenInfo } = useDatatokenInfo({
    onSuccess: (result) => {
      console.log("[getDatatokenInfo]success, result:", result);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPostText(e.target.value);
  };

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const handleTypeChange = (checked: boolean) => {
    if (checked) {
      setFileType(FileType.Datatoken);
    } else {
      setFileType(FileType.Public);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setCurrency(currency as Currency);
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAmount(e.target.value);
  };

  const handlePost = async () => {
    if (isPostLoading) {
      return;
    }

    try {
      setIsPostLoading(true);
      let result;
      if (fileType === FileType.Public) {
        result = await createPublicStream({
          modelId: postModelId,
          stream: {
            appVersion,
            text: postText,
            images: imagesList,
            videos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        result = await createPayableStream({
          modelId: postModelId,
          stream: {
            appVersion,
            text: postText,
            images: imagesList,
            videos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          currency,
          amount: parseFloat(amount),
          collectLimit: 1000,
          encrypted: {
            text: true,
            images: true,
            videos: false,
          },
        });
      }
      console.log("post success:", result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPostLoading(false);
    }
  };

  const handleUnlock = async (streamId: string) => {
    if (isUnlockLoading) {
      return;
    }

    try {
      setIsUnlockLoading(true);
      await unlockStream(streamId);
    } catch (error) {
    } finally {
      setIsUnlockLoading(false);
    }
  };

  return (
    <div id="home">
      <div className="post-area">
        <Input.TextArea
          rows={4}
          maxLength={200}
          value={postText}
          onChange={handleInputChange}
          showCount
        />
        <div className="post-area__images">
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            capture
          >
            {fileList.length < 5 && "+"}
          </Upload>
        </div>

        <div className="post-area__select">
          <Switch
            checkedChildren="Public"
            unCheckedChildren="Payable"
            onChange={handleTypeChange}
            defaultChecked={false}
          />
          <Input
            addonBefore={
              <Select
                defaultValue={currency}
                style={{ width: 100 }}
                onChange={handleCurrencyChange}
                disabled={fileType === FileType.Public}
                options={[
                  { value: Currency.WMATIC, label: Currency.WMATIC },
                  { value: Currency.WETH, label: Currency.WETH },
                  { value: Currency.USDC, label: Currency.USDC },
                  { value: Currency.DAI, label: Currency.DAI },
                ]}
              />
            }
            style={{ width: 250 }}
            defaultValue={amount}
            onChange={handleAmountChange}
            disabled={fileType === FileType.Public}
          />
        </div>
        <Button
          className="post-area__button"
          type="primary"
          onClick={handlePost}
          loading={isPostLoading}
        >
          Post
        </Button>
      </div>

      <div className="display-area">
        {streamsMap &&
          sortedStreamIds.map((streamId, index1) => {
            const fileType = streamsMap[streamId].streamContent.file.fileType;
            let cardActions = [
              <Button
                icon={<EditOutlined key="edit" rev={undefined} />}
                type="text"
              />,
            ];
            if (fileType === FileType.Datatoken) {
              cardActions.push(
                <Button
                  icon={<LockOutlined rev={undefined} />}
                  type="text"
                  loading={isUnlockLoading}
                  onClick={() => handleUnlock(streamId)}
                >{`${streamsMap[streamId].datatokenInfo?.collect_info?.price.amount} ${streamsMap[streamId].datatokenInfo?.collect_info?.price.currency}`}</Button>
              );
            }
            return (
              <Card
                className="display-area__card"
                hoverable
                key={index1}
                actions={cardActions}
              >
                <Card.Meta
                  className="author-info"
                  avatar={
                    <Avatar
                      src={`https://effigy.im/a/${getAddressFromPkh(
                        streamsMap[streamId].pkh
                      )}.png`}
                    />
                  }
                  title={abbreviateAddress(
                    getAddressFromPkh(streamsMap[streamId].pkh)
                  )}
                  description={
                    <>
                      {addressReputationsMap[
                        getAddressFromPkh(streamsMap[streamId].pkh)
                      ]?.map((reputationName) => {
                        return (
                          <Tag
                            icon={
                              reputationName === "developer-of-faust" ||
                              reputationName ===
                                "contributors-of-dataverse-cda" ? (
                                <GithubOutlined rev={undefined} />
                              ) : undefined
                            }
                            color={
                              reputationName === "developer-of-faust"
                                ? "#131313"
                                : reputationName ===
                                  "contributors-of-dataverse-cda"
                                ? "#55acee"
                                : "cyan"
                            }
                          >
                            {reputationName}
                          </Tag>
                        );
                      })}
                    </>
                  }
                ></Card.Meta>

                <div className="post-content">
                  <div className="text">
                    {streamsMap[streamId].streamContent.content.text}
                  </div>
                  <div>
                    {streamsMap[streamId].streamContent.content.images.map(
                      (imageUrl: string, index2: number) => {
                        return (
                          <span className="images-container">
                            <Image
                              className="image"
                              key={index2}
                              width={120}
                              src={imageUrl}
                              fallback={LockImage}
                            />
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};
