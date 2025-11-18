'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUser } from '@/firebase/firestore';
import { Layout, Menu, Avatar, Dropdown, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  CommentOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { User } from '@/lib/types';
import { AuthGuard } from '@/components/AuthGuard';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login');
        return;
      }

      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const isPatient = user.role === 'patient';
  const isPsychologist = user.role === 'psychologist';

  const patientMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/tests',
      icon: <FileTextOutlined />,
      label: 'Teste Disponibile',
    },
    {
      key: '/patient/history',
      icon: <HistoryOutlined />,
      label: 'Istoric Teste',
    },
    {
      key: '/patient/invite',
      icon: <TeamOutlined />,
      label: 'Invită Psiholog',
    },
  ];

  const psychologistMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/psychologist/patients',
      icon: <TeamOutlined />,
      label: 'Pacienți',
    },
    {
      key: '/psychologist/comments',
      icon: <CommentOutlined />,
      label: 'Comentarii',
    },
  ];

  const menuItems = isPatient ? patientMenuItems : psychologistMenuItems;

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Deconectare
      </Menu.Item>
    </Menu>
  );

  return (
    <AuthGuard requireRole={user.role}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          width={250}
          theme="dark"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="p-4 text-white text-center border-b border-gray-700">
            <Text strong className="text-white">
              {isPatient ? 'Pacient' : 'Psiholog'}
            </Text>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
          />
        </Sider>
        <Layout>
          <Header className="bg-white dark:bg-gray-800 px-6 flex items-center justify-between">
            <Text strong className="text-lg">
              {isPatient ? 'Dashboard Pacient' : 'Dashboard Psiholog'}
            </Text>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text>{user.name}</Text>
              </div>
            </Dropdown>
          </Header>
          <Content className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}

