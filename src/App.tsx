import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TrophyOutlined,
  UserOutlined,
  SettingOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button } from "antd";
import AppRouter from "./router";
import Logo from "./assets/faust.png";
import LogoSmall from "./assets/faust_small.png";
import { useApp, useStore } from "@dataverse/hooks";
import "./App.scss";
import { abbreviateAddress } from "./utils";
import { useAppStore } from "./store";

export const App: React.FC = () => {
  const { modelParser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const { address } = useStore();
  const { connectApp } = useApp({
    appId: modelParser.appId,
    autoConnect: true,
    onPending: () => {
      console.log("connecting...");
    },
    onSuccess: (result) => {
      console.log("[connect]connect app success, result:", result);
    },
  });

  const handleClickMenu = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <div id="app">
      <Layout>
        <Layout.Sider
          className="sidebar"
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="logo">
            {collapsed ? (
              <img src={LogoSmall} alt="logo" />
            ) : (
              <img src={Logo} alt="logo" />
            )}
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[location.pathname.substring(1)]}
            onClick={handleClickMenu}
            items={[
              {
                key: "home",
                icon: <HomeOutlined rev={undefined} />,
                label: "Home",
              },
              {
                key: "profile",
                icon: <UserOutlined rev={undefined} />,
                label: "Profile",
              },
              {
                key: "verify",
                icon: <TrophyOutlined rev={undefined} />,
                label: "Verify",
              },
              {
                key: "settings",
                icon: <SettingOutlined rev={undefined} />,
                label: "Settings",
              },
            ]}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Header className="header">
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuUnfoldOutlined rev={undefined} />
                ) : (
                  <MenuFoldOutlined rev={undefined} />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />

            <Button
              icon={<WalletOutlined rev={undefined} />}
              type="primary"
              onClick={() => connectApp()}
            >
              {address ? abbreviateAddress(address) : "Connect Wallet"}
            </Button>
          </Layout.Header>
          <Layout.Content className="content">
            <AppRouter />
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;
