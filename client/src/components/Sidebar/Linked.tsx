// modules
import React from 'react';

// styles
import { styles } from '../../assets/styles/styles';
import {
  Avatar,
  Col,
  List as _List,
  message,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

// atoms
import { IWalletTypes } from '../../atoms/Atoms';

const { Text } = Typography;

const Linked = ({ wallet }: { wallet: IWalletTypes }) => {
  console.log(wallet);
  return (
    <Row gutter={[48, 48]}>
      <Col span={22} offset={1}>
        <div
          style={{
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${styles.very_light_blue_main}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${styles.space_2}`,
            }}
          >
            <Avatar icon={<UserOutlined />} />
          </div>
          <Tooltip placement="top" title={'COPY'}>
            <Text
              onClick={() => {
                navigator.clipboard.writeText(wallet.address);
                message.success('Copied!');
              }}
              style={{
                color: `${styles.soft_blue}`,
                fontSize: `${styles.fs_5}`,
                fontWeight: `${styles.fw_500}`,
                cursor: 'pointer',
              }}
            >
              {wallet.address.length > 10 &&
                wallet.address.substr(0, 6) +
                  '...' +
                  wallet.address.substr(
                    wallet.address.length - 4,
                    wallet.address.length,
                  )}
            </Text>
          </Tooltip>
        </div>
      </Col>
    </Row>
  );
};

export default Linked;
