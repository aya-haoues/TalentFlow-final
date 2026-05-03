import { Layout, Menu, Avatar, Badge, Dropdown, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, FileTextOutlined, TeamOutlined,
  CalendarOutlined, StarOutlined, BellOutlined,
  LogoutOutlined, UserOutlined
} from '@ant-design/icons';
import { authService } from '../../services/api';

const PRIMARY = '#00a89c';
const { Sider, Content, Header } = Layout;

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // On part du principe que Sabiha Kacem est l'utilisateur connecté
  const user = authService.getCurrentUser();
  const managerName = user?.name;

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Menu déroulant pour l'avatar
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Mon Profil',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Déconnexion',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const sidebarItems = [
    { key: '/manager/dashboard',   icon: <DashboardOutlined />, label: 'Tableau de bord' },
    { key: '/manager/jobs',         icon: <FileTextOutlined />,  label: 'Offres' },
    { key: '/manager/candidates',   icon: <TeamOutlined />,      label: 'Candidats' },
    { key: '/manager/interviews',   icon: <CalendarOutlined />,  label: 'Entretiens' },
    { key: '/manager/evaluations', icon: <StarOutlined />,      label: 'Évaluations' },
  ];

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
          items={sidebarItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          paddingRight: 24 
        }}>
          <Space size={24}>
            <Badge count={3}>
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            
            {/* Dropdown sur l'Avatar et le Nom */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <span style={{ fontWeight: 500, color: '#1f2937' }}>{managerName}</span>
                <Avatar style={{ background: PRIMARY, verticalAlign: 'middle' }}>
                  {managerName.charAt(0).toUpperCase()}
                </Avatar>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: '32px 40px', background: '#f9fafb' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}