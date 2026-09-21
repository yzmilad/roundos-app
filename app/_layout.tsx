import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ color, fontSize: 18 }}>{glyph}</Text>;
}

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#070b10',
            borderTopColor: '#1c2433',
            height: 58,
          },
          tabBarActiveTintColor: '#00d4ff',
          tabBarInactiveTintColor: '#7a8a99',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Watch',
            tabBarIcon: ({ color }) => <TabIcon glyph="⌚" color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <TabIcon glyph="🔔" color={color} />,
          }}
        />
        <Tabs.Screen
          name="music"
          options={{
            title: 'Music',
            tabBarIcon: ({ color }) => <TabIcon glyph="♪" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tools"
          options={{
            title: 'Tools',
            tabBarIcon: ({ color }) => <TabIcon glyph="⌘" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
