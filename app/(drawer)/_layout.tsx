import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from './_drawer';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        drawerInactiveTintColor: Colors[colorScheme ?? 'light'].text,
        drawerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Chat',
          title: 'Local LLM Chat',
        }}
      />
    </Drawer>
  );
}
