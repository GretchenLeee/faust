import React from "react";
import "./index.scss";
import { CredentialInfo, SismoGroupInfo } from "faust-sismo-client";

interface IProps {
  credentialInfoList?: CredentialInfo[];
  groupInfoList?: SismoGroupInfo[];
}

const Reputation = ({ credentialInfoList, groupInfoList }: IProps) => {
  const hasReputation = (groupId: string) => {
    const filterArr = credentialInfoList?.filter(
      reputationInfo =>
        reputationInfo.groupId === groupId && reputationInfo.value === true,
    );
    if (filterArr && filterArr.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className='profile'>
      <div className='profile__reputations'>
        {groupInfoList?.map((groupInfo: SismoGroupInfo, index) => {
          return (
            <div className='profile__reputations-item' key={index}>
              <div className='name'>{`${
                hasReputation(groupInfo.id) ? "✅" : "❌"
              } ${groupInfo.name}`}</div>
              <div className='group-id'>{groupInfo.id}</div>
              <div className='description'>{groupInfo.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Reputation };
