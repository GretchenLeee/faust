import { Card, Select, Switch } from "antd";
import React from "react";
import "./index.scss";

export const Settings: React.FC = () => {
  const handleCookies = (checked: boolean) => {
    window.localStorage.setItem("is-faust-enable-cookies", checked.toString());
  };

  return (
    <div id="settings">
      <Card>
        <div className="item-container">
          <div>Cookies</div>
          <Switch defaultChecked onChange={handleCookies} />
        </div>
        <div className="item-container">
          <div>Language</div>
          <Select
            defaultValue="english"
            style={{ width: 100 }}
            options={[
              { value: "english", label: "English" },
              { value: "chinese", label: "Chinese", disabled: true },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};
