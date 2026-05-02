// src/components/manager/ManagerLayout.tsx
import { Layout, Menu, Avatar, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, FileTextOutlined, TeamOutlined,
  CalendarOutlined, StarOutlined, BellOutlined
} from '@ant-design/icons';

const PRIMARY = '#00a89c';
const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/manager/dashboard',   icon: <DashboardOutlined />, label: 'Tableau de bord' },
  { key: '/manager/jobs',        icon: <FileTextOutlined />,  label: 'Offres' },
  { key: '/manager/candidates',  icon: <TeamOutlined />,      label: 'Candidats' },
  { key: '/manager/interviews',  icon: <CalendarOutlined />,  label: 'Entretiens' },
  { key: '/manager/evaluations', icon: <StarOutlined />,      label: 'Évaluations' },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY }}>TalentFlow</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Espace Manager</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 24 }}>
          <Badge count={3}>
            <BellOutlined style={{ fontSize: 18, marginRight: 20, cursor: 'pointer' }} />
          </Badge>
          <Avatar style={{ background: PRIMARY }}>M</Avatar>
        </Header>
        <Content style={{ padding: '32px 40px', background: '#f9fafb' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}