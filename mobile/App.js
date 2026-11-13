import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { api } from './src/api/client';
import Accueil from './src/pages/Accueil';
import Meteo from './src/pages/Meteo';
import Alertes from './src/pages/Alertes';
import Parcelles from './src/pages/Parcelles';
import Journal from './src/pages/Journal';
import Conseils from './src/pages/Conseils';
import TableauDeBord from './src/pages/TableauDeBord';

const Stack = createNativeStackNavigator();

export default function App() {
  // restaure la session et la langue au démarrage (AsyncStorage)
  useEffect(() => { api.charger(); }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="Meteo" component={Meteo} />
        <Stack.Screen name="Alertes" component={Alertes} />
        <Stack.Screen name="Parcelles" component={Parcelles} />
        <Stack.Screen name="Journal" component={Journal} />
        <Stack.Screen name="Conseils" component={Conseils} />
        <Stack.Screen name="TableauDeBord" component={TableauDeBord} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
